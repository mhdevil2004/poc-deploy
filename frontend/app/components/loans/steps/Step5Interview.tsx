"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Camera, Mic, MapPin, CheckCircle2 } from "lucide-react";
import { UIGuideOverlay } from "@/components/interview/UIGuideOverlay";
import {
  startInterview,
  submitInterviewAnswer,
  submitInterviewPermission,
  type InterviewResponse
} from "@/lib/api/interviewService";

export function Step5Interview({ onComplete }: { onComplete: () => void }) {
  const [state, setState] = useState<InterviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    startInterview("Fintilla_SDK_PARTNER")
      .then(res => {
        setState(res);
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to start interview session.");
        setLoading(false);
      });
  }, []);

  // Monitor for the "completed" state to trigger the transition to Step 6
  useEffect(() => {
    if (state?.action === "completed") {
      // Instead of forcing an immediate transition, we can render a "Continue" button
      // Or auto-advance. We will render a button in MessageView for "completed".
    }
  }, [state, onComplete]);

  const handleAnswer = async (answer: string) => {
    // Use the question id if present, fall back to the current step name
    const questionId = state?.question?.id ?? state?.step;
    if (!questionId || !state) return;
    setLoading(true);
    try {
      const nextState = await submitInterviewAnswer(state.session_id, questionId, answer);
      setState(nextState);
    } catch (err) {
      setError("Failed to submit answer.");
    } finally {
      setLoading(false);
    }
  };

  const handlePermission = async (granted: boolean) => {
    if (!state) return;
    setLoading(true);
    let permType = "";
    if (state.action === "request_camera_permission") permType = "camera";
    else if (state.action === "request_microphone_permission") permType = "microphone";
    else if (state.action === "request_location_permission") permType = "location";

    try {
      const nextState = await submitInterviewPermission(state.session_id, permType, granted ? "granted" : "denied");
      setState(nextState);
    } catch (err) {
      setError("Failed to record permission.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !state) {
    return (
      <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
    );
  }

  if (error || !state) {
    return (
      <div className="bg-red-50 p-6 rounded-2xl text-red-700 border border-red-100">{error}</div>
    );
  }

  return (
    <div className="relative">
      <UIGuideOverlay guide={state.ui?.guide} />

      {/* Progress Bar (Interview specific progress) */}
      <div className="w-full bg-white rounded-full h-2 mb-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div
          className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${(state.progress.current / state.progress.total) * 100}%` }}
        />
      </div>

      {/* Dynamic Views based on Backend Type */}
      {state.type === "message" && (
        <MessageView state={state} onAnswer={handleAnswer} onComplete={onComplete} />
      )}
      {state.type === "permission" && (
        <PermissionView state={state} onCompletePermission={handlePermission} />
      )}
      {state.type === "tips" && (
        <TipsView state={state} onAnswer={handleAnswer} />
      )}
      {state.type === "video" && (
        <VideoInitView state={state} onAnswer={handleAnswer} />
      )}
      {state.type === "video_question" && (
        <VideoQuestionView state={state} onAnswer={handleAnswer} />
      )}
    </div>
  );
}

// --- Views ---

function MessageView({ state, onAnswer, onComplete }: { state: InterviewResponse, onAnswer: (ans: string) => void, onComplete: () => void }) {
  return (
    <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white text-center space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{state.message}</h2>

      {state.question && (
        <div className="mt-8 space-y-4">
          <p className="text-lg text-slate-600 font-medium">{state.question.text}</p>

          {state.question.input_type === "choice" && (
            <div className="flex flex-col gap-3 max-w-sm mx-auto">
              {state.question.options?.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => onAnswer(opt.id)}
                  className="w-full py-3 px-6 rounded-2xl border border-white bg-white/70 hover:border-blue-200 hover:bg-blue-50/60 transition-all font-semibold text-slate-700 hover:text-slate-900 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {state.action === "completed" && (
        <div className="mt-8">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <button onClick={onComplete} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-bold transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50">
            Continue to Final Review
          </button>
        </div>
      )}
    </div>
  );
}

function PermissionView({ state, onCompletePermission }: { state: InterviewResponse, onCompletePermission: (granted: boolean) => void }) {
  const requestPermission = async () => {
    try {
      if (state.action === "request_camera_permission") {
        await navigator.mediaDevices.getUserMedia({ video: true });
      } else if (state.action === "request_microphone_permission") {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } else if (state.action === "request_location_permission") {
        await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
      }
      onCompletePermission(true);
    } catch (err) {
      console.error("Permission error:", err);
      alert("Permission denied or not available in this context. Please check browser settings.");
      onCompletePermission(false);
    }
  };

  const getIcon = () => {
    if (state.action === "request_camera_permission") return <Camera className="w-12 h-12 text-blue-600" />;
    if (state.action === "request_microphone_permission") return <Mic className="w-12 h-12 text-blue-600" />;
    return <MapPin className="w-12 h-12 text-blue-600" />;
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white text-center space-y-8">
      <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
        {getIcon()}
      </div>
      <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{state.message}</h2>
      <button
        id="permission_btn"
        onClick={requestPermission}
        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-bold transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 text-lg"
      >
        Grant Permission
      </button>
    </div>
  );
}

function TipsView({ state, onAnswer }: { state: InterviewResponse, onAnswer: (ans: string) => void }) {
  return (
    <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
      <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-6 text-center">{state.message}</h2>
      <ul className="space-y-4 max-w-lg mx-auto mb-10">
        {state.tips?.map((tip, idx) => (
          <li key={idx} className="flex items-start gap-3 text-slate-700 bg-white/70 p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span className="font-medium">{tip}</span>
          </li>
        ))}
      </ul>

      {state.question && (
        <div className="text-center border-t pt-8">
          <p className="text-lg font-bold mb-4">{state.question.text}</p>
          {state.question.options?.map(opt => (
            <button
              key={opt.id}
              onClick={() => onAnswer(opt.id)}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-bold transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function VideoInitView({ state, onAnswer }: { state: InterviewResponse, onAnswer: (ans: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (state.action === "start_video") {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(s => {
          setStream(s);
          if (videoRef.current) videoRef.current.srcObject = s;
        })
        .catch(() => console.error("Could not start video feed"));
    }
    return () => {
      stream?.getTracks().forEach(t => t.stop());
    };
  }, [state.action]);

  return (
    <div className="bg-slate-950 p-4 rounded-3xl shadow-[0_8px_40px_rgb(0,0,0,0.18)] overflow-hidden relative border border-slate-800">
      <video ref={videoRef} autoPlay muted playsInline className="w-full h-[500px] object-cover rounded-2xl bg-slate-900" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent pointer-events-none" />

      <div className="absolute bottom-8 left-0 right-0 text-center px-8 z-10">
        <h2 className="text-2xl font-bold text-white mb-6 drop-shadow-md">{state.message}</h2>
        <button
          id="start_video_button"
          onClick={() => {
            onAnswer("ready");
          }}
          className="px-8 py-3 bg-white text-slate-900 rounded-full font-bold hover:bg-slate-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
        >
          Begin Interview
        </button>
      </div>
    </div>
  );
}

function VideoQuestionView({ state, onAnswer }: { state: InterviewResponse, onAnswer: (ans: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [answerText, setAnswerText] = useState("");
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let mounted = true;
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(s => {
        if (!mounted) {
          s.getTracks().forEach(t => t.stop());
          return;
        }
        streamRef.current = s;
        if (videoRef.current) videoRef.current.srcObject = s;
      });

    return () => {
      mounted = false;
      streamRef.current?.getTracks().forEach(t => t.stop());
    }
  }, []);

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-white flex flex-col md:flex-row">
      {/* Video Side */}
      <div className="md:w-1/2 bg-slate-950 relative">
        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover min-h-[400px]" />
        <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse flex items-center gap-1.5">
          <div className="w-2 h-2 bg-white rounded-full" />
          REC
        </div>
      </div>

      {/* Question Side */}
      <div className="md:w-1/2 p-8 flex flex-col justify-center">
        <div className="mb-8">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Current Question</span>
          <h2 className="text-xl font-bold text-slate-900 mt-2 leading-snug">
            {state.question?.text}
          </h2>
        </div>

        {/* Mock Transcription / Text Input for POC */}
        <div className="space-y-4">
          <label className="text-sm text-slate-500 font-medium flex items-center gap-2">
            <Mic className="w-4 h-4" /> Speak or type your answer:
          </label>
          <textarea
            value={answerText}
            onChange={e => setAnswerText(e.target.value)}
            rows={4}
            className="w-full p-4 rounded-2xl border border-white bg-white/70 focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/20 resize-none text-slate-900 placeholder:text-slate-400 outline-none"
            placeholder="Recording in progress..."
          />
          <button
            onClick={() => onAnswer(answerText)}
            disabled={!answerText.trim()}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-bold transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 disabled:opacity-50"
          >
            Submit Answer & Next
          </button>
        </div>
      </div>
    </div>
  );
}
