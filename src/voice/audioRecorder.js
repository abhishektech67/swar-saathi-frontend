/* ======================================================================
 * Swar Saathi — audioRecorder.js
 * ----------------------------------------------------------------------
 * Records raw PCM from the microphone with the Web Audio API.
 *
 * Why PCM and not MediaRecorder? Raw samples go straight into the analyzer
 * (no lossy codec, no decodeAudioData quirks on Safari/iOS) and nothing is
 * ever encoded, stored or uploaded. The microphone is requested only when
 * start() is called and every track/node/context is released in cleanup().
 * ====================================================================== */

export class VoiceError extends Error {
  constructor(code, message) {
    super(message || code);
    this.code = code;
  }
}

const WORKLET_SRC = `
class SwarPcm extends AudioWorkletProcessor {
  process(inputs) {
    const ch = inputs[0] && inputs[0][0];
    if (ch && ch.length) this.port.postMessage(ch.slice(0));
    return true;
  }
}
registerProcessor("swar-pcm", SwarPcm);
`;

export function isRecordingSupported() {
  return Boolean(
    typeof navigator !== "undefined" &&
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia &&
      (window.AudioContext || window.webkitAudioContext)
  );
}

export class VoiceRecorder {
  /**
   * @param {object} opts
   * @param {number} [opts.maxSeconds=10]  automatic stop
   * @param {(elapsedSec:number)=>void} [opts.onProgress]
   */
  constructor({ maxSeconds = 10, onProgress } = {}) {
    this.maxSeconds = maxSeconds;
    this.onProgress = onProgress;
    this.chunks = [];
    this.recordedSamples = 0;
    this.active = false;
    this.finished = false;
    this.analyser = null;
    this.sampleRate = 0;
    this._cleanupFns = [];
    this._timer = null;
    this.done = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
    // avoid "unhandled rejection" noise if the caller cancels
    this.done.catch(() => {});
  }

  /** Ask for the microphone and begin capturing. Throws VoiceError. */
  async start() {
    if (this.active || this.finished) throw new VoiceError("BUSY");
    if (!isRecordingSupported()) throw new VoiceError("UNSUPPORTED");

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          // raw-ish signal: AGC/noise suppression would hide real loudness
          // and pitch behaviour, so request them off (browsers may ignore)
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
    } catch (err) {
      const name = err && err.name;
      if (name === "NotAllowedError" || name === "SecurityError" || name === "PermissionDeniedError") throw new VoiceError("PERMISSION_DENIED");
      if (name === "NotFoundError" || name === "DevicesNotFoundError" || name === "OverconstrainedError") throw new VoiceError("NO_MIC");
      if (name === "NotReadableError" || name === "TrackStartError" || name === "AbortError") throw new VoiceError("MIC_BUSY");
      throw new VoiceError("UNSUPPORTED");
    }

    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const ctx = new Ctx();
      this.sampleRate = ctx.sampleRate;
      this._cleanupFns.push(() => stream.getTracks().forEach((t) => t.stop()));
      this._cleanupFns.push(() => ctx.close().catch(() => {}));
      if (ctx.state === "suspended") await ctx.resume();

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser);
      this.analyser = analyser;

      // silent sink: some browsers only pull audio through nodes that reach the destination
      const sink = ctx.createGain();
      sink.gain.value = 0;
      sink.connect(ctx.destination);

      const onSamples = (block) => {
        if (!this.active) return;
        this.chunks.push(block);
        this.recordedSamples += block.length;
        if (this.recordedSamples >= this.maxSeconds * this.sampleRate) this.stop();
      };

      let usingWorklet = false;
      if (ctx.audioWorklet && typeof Blob !== "undefined" && window.URL && URL.createObjectURL) {
        try {
          const url = URL.createObjectURL(new Blob([WORKLET_SRC], { type: "application/javascript" }));
          await ctx.audioWorklet.addModule(url);
          URL.revokeObjectURL(url);
          const node = new AudioWorkletNode(ctx, "swar-pcm");
          node.port.onmessage = (e) => onSamples(e.data);
          source.connect(node);
          node.connect(sink);
          this._cleanupFns.push(() => {
            node.port.onmessage = null;
            node.disconnect();
          });
          usingWorklet = true;
        } catch {
          usingWorklet = false; // fall back below
        }
      }
      if (!usingWorklet) {
        const proc = ctx.createScriptProcessor(4096, 1, 1);
        proc.onaudioprocess = (e) => onSamples(new Float32Array(e.inputBuffer.getChannelData(0)));
        source.connect(proc);
        proc.connect(sink);
        this._cleanupFns.push(() => {
          proc.onaudioprocess = null;
          proc.disconnect();
        });
      }
      this._cleanupFns.push(() => {
        source.disconnect();
        sink.disconnect();
      });

      // microphone unplugged / permission revoked mid-recording
      stream.getTracks().forEach((t) => {
        t.onended = () => {
          if (this.active) this._fail(new VoiceError("STREAM_ENDED"));
        };
      });

      this.active = true;
      this._timer = setInterval(() => {
        if (this.onProgress && this.sampleRate) this.onProgress(Math.min(this.maxSeconds, this.recordedSamples / this.sampleRate));
      }, 100);
    } catch (err) {
      this._cleanup();
      throw err instanceof VoiceError ? err : new VoiceError("UNSUPPORTED");
    }
  }

  /** Stop and resolve `done` with { samples, sampleRate }. Safe to call twice. */
  stop() {
    if (!this.active || this.finished) return;
    this.active = false;
    this.finished = true;
    const samples = new Float32Array(this.recordedSamples);
    let offset = 0;
    for (const c of this.chunks) {
      samples.set(c, offset);
      offset += c.length;
    }
    const sampleRate = this.sampleRate;
    this._cleanup();
    this._resolve({ samples, sampleRate });
  }

  /** Abort without producing a result (e.g. component unmount). */
  cancel() {
    if (this.finished) return;
    this.active = false;
    this.finished = true;
    this._cleanup();
    this._reject(new VoiceError("CANCELLED"));
  }

  _fail(err) {
    if (this.finished) return;
    this.active = false;
    this.finished = true;
    this._cleanup();
    this._reject(err);
  }

  _cleanup() {
    if (this._timer) clearInterval(this._timer);
    this._timer = null;
    this.analyser = null;
    this.chunks = [];
    for (const fn of this._cleanupFns.splice(0)) {
      try {
        fn();
      } catch {
        /* already released */
      }
    }
  }
}
