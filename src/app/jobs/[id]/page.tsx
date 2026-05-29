"use client";

import { useState, useEffect, use } from "react";
import { ChevronLeft, Globe, Building2, DollarSign, Clock, IdCard, Car, BedDouble, MessageCircle, Pencil, Snowflake, Share2, Trash2, Eye, Heart, Users, X, PlayCircle, Archive, ArchiveRestore, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import posthog from "posthog-js";
import BottomNav from "@/components/BottomNav";
import { shareJob } from "@/lib/share";

type Job = {
  id: string;
  title: string;
  salary: string;
  company_address: string;
  job_states: string[];
  job_cities: string[];
  categories: string[];
  logo_url: string | null;
  active: boolean;
  weekend: boolean;
  holidays: boolean;
  license: boolean;
  car: boolean;
  housing: boolean;
  start_time: string;
  end_time: string;
  created_at: string;
  q1?: string;
  q2?: string;
  q3?: string;
};

type Applicant = {
  id: string;
  applicant_id: string;
  status: string;
  answers: string[];
  about_self: string;
  name: string;
  age: number | null;
  gender: string;
  license: boolean;
  languages: string[];
  avatar_url: string | null;
  country: string;
  us_state: string;
  city: string;
};

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [confirmFreeze, setConfirmFreeze] = useState(false);
  const [frozen, setFrozen] = useState(false);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [viewCount, setViewCount] = useState(0);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [showArchivedApplicants, setShowArchivedApplicants] = useState(false);
  const [conversationCount, setConversationCount] = useState(0);

  const loadApplicants = async () => {
    const { data } = await supabase
      .from("applications")
      .select("id, status, applicant_id, answers, about_self, profiles(first_name, last_name, age, gender, intl_license, languages, country, us_state, city)")
      .eq("job_id", id)
      .order("created_at", { ascending: false });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setApplicants((data || []).map((a: any) => ({
      id: a.id,
      applicant_id: a.applicant_id,
      status: a.status || "pending",
      answers: a.answers || [],
      about_self: a.about_self || "",
      name: a.profiles?.first_name || "מועמד",
      age: a.profiles?.age || null,
      gender: a.profiles?.gender || "",
      license: !!a.profiles?.intl_license,
      languages: a.profiles?.languages || [],
      avatar_url: null,
      country: a.profiles?.country || "",
      us_state: a.profiles?.us_state || "",
      city: a.profiles?.city || "",
    })));
  };

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data: found } = await supabase
        .from("jobs").select("*")
        .eq("id", id).eq("created_by", user.id).single();
      if (found) {
        setJob(found as unknown as Job);
        setFrozen(!!found.frozen);
      }
      await loadApplicants();
      const { count: vCount } = await supabase
        .from("job_views").select("*", { count: "exact", head: true })
        .eq("job_id", id);
      const { count: appCount } = await supabase
        .from("applications").select("*", { count: "exact", head: true })
        .eq("job_id", id);
      setViewCount(Math.max(vCount || 0, appCount || 0));
      const { count: convCount } = await supabase
        .from("conversations")
        .select("id", { count: "exact", head: true })
        .eq("job_id", id);
      setConversationCount(convCount || 0);
      setLoading(false);
    })();
  }, [id]);

  const handleFreeze = async () => {
    await supabase.from("jobs").update({ frozen: true }).eq("id", id);
    setFrozen(true);
    setConfirmFreeze(false);
  };

  const handleUnfreeze = async () => {
    await supabase.from("jobs").update({ frozen: false }).eq("id", id);
    setFrozen(false);
  };

  const handleRemove = async () => {
    await supabase.from("jobs").delete().eq("id", id);
    router.push("/my-jobs");
  };

  const handleApprove = async (applicant: Applicant) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("applications").update({ status: "approved" }).eq("id", applicant.id);
    fetch("https://eywrpbhgvuuupyunalaq.supabase.co/functions/v1/smart-service", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "approval", recipient_id: applicant.applicant_id, job_title: job?.title ?? "" }),
    }).catch(() => {});
    const { data: conv } = await supabase
      .from("conversations")
      .upsert(
        { job_id: id, employer_id: user.id, applicant_id: applicant.applicant_id },
        { onConflict: "job_id,applicant_id" }
      )
      .select("id")
      .single();
    setSelectedApplicant(null);
    if (conv?.id) {
      posthog.capture("chat_initiated", { job_id: id, applicant_id: applicant.applicant_id, room_id: conv.id });
      router.push(`/messages/${conv.id}`);
    } else await loadApplicants();
  };

  const handleReject = async (applicant: Applicant) => {
    await supabase.from("applications").update({ status: "rejected" }).eq("id", applicant.id);
    setSelectedApplicant(null);
    await loadApplicants();
  };

  if (loading) return (
    <div className="flex flex-col min-h-screen items-center justify-center" dir="rtl">
      <div className="w-8 h-8 border-4 border-terracotta border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!job) return (
    <div className="flex flex-col min-h-screen items-center justify-center gap-4" dir="rtl">
      <p className="text-ink-2 text-base">המשרה לא נמצאה</p>
      <button onClick={() => router.push("/my-jobs")} className="text-terracotta font-bold">חזרה למודעות שלי</button>
    </div>
  );

  const createdDate = job.created_at ? new Date(job.created_at).toLocaleDateString("he-IL") : "";
  const pending = applicants.filter(a => a.status === "pending");
  const approved = applicants.filter(a => a.status === "approved");
  const archived = applicants.filter(a => a.status === "archived");
  const questions = [job.q1, job.q2, job.q3].filter(Boolean) as string[];

  return (
    <div className="flex flex-col min-h-screen bg-cream" dir="rtl">

      <header className="bg-paper px-4 pt-12 pb-3 flex items-center justify-between border-b border-divider sticky top-0 z-40">
        <div className="flex items-baseline gap-1">
          <span className="font-serif text-lg font-bold text-ink tracking-tight">Hevre</span>
          <span className="w-1.5 h-1.5 rounded-full bg-terracotta self-center" />
        </div>
        <div className="w-11" />
        <button onClick={() => router.push("/my-jobs")} className="w-11 h-11 flex items-center justify-center">
          <ChevronLeft size={24} className="text-ink-2" strokeWidth={2} />
        </button>
      </header>

      <main className="flex-1 px-4 pt-5 pb-44 flex flex-col gap-4">

        {/* Title + logo */}
        <div className="flex items-center justify-between gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cream-warm flex items-center justify-center overflow-hidden shrink-0 font-serif text-xl font-bold text-terracotta">
            {job.logo_url
              ? <Image src={job.logo_url} alt="לוגו" width={48} height={48} className="w-full h-full object-cover" />
              : (job.title[0] || "H")}
          </div>
          <h1 className="font-serif text-xl font-bold text-ink text-right leading-snug tracking-tight flex-1">{job.title}</h1>
        </div>

        {/* Status tags */}
        <div className="flex gap-2 justify-end flex-wrap">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-cream bg-ink rounded-lg px-3 py-1.5">
            <span className={`w-2 h-2 rounded-full inline-block ${frozen ? "bg-warm-danger" : "bg-warm-success"}`} />
            {frozen ? "קפוא" : "פעיל"}
          </span>
          {job.boosted_until && new Date(job.boosted_until) > new Date() ? (
            <span className="flex items-center gap-1.5 text-xs font-bold text-terracotta bg-[#FFF0E6] ring-1 ring-terracotta rounded-lg px-3 py-1.5">
              ✦ {job.boost_tier === "featured" ? "גיוס מהיר" : "בוסט"}
              {" · "}
              {(() => {
                const diff = new Date(job.boosted_until).getTime() - Date.now();
                const hours = Math.floor(diff / 3600000);
                if (hours < 24) {
                  const mins = Math.floor((diff % 3600000) / 60000);
                  return `${hours}:${String(mins).padStart(2, "0")} שע׳`;
                }
                return `${Math.floor(diff / 86400000)} ימים`;
              })()}
            </span>
          ) : (
            <span className="text-xs font-semibold text-ink-2 bg-cream-warm ring-1 ring-divider rounded-lg px-3 py-1.5">מודעה בסיסית</span>
          )}
        </div>

        {/* Details */}
        <div className="bg-paper rounded-2xl px-4 py-4 flex flex-col gap-2.5">
          {[
            { icon: Globe, label: "מדינה", text: job.job_states?.join(", ") || "לא צוין" },
            { icon: Building2, label: "עיר", text: job.job_cities?.join(", ") || "לא צוין" },
            { icon: DollarSign, label: "שכר", text: job.salary || "לא צוין" },
            { icon: Clock, label: "שעות עבודה", text: job.start_time && job.end_time ? `${job.start_time} - ${job.end_time}` : "לא צוין" },
            { icon: IdCard, label: "חובה רישיון", text: job.license ? "כן" : "לא" },
            { icon: Car, label: "מספק רכב", text: job.car ? "כן" : "לא" },
            { icon: BedDouble, label: "מספק דיור", text: job.housing ? "כן" : "לא" },
          ].map(({ icon: Icon, label, text }, i) => (
            <div key={i} className="flex items-center gap-2" style={{ direction: "ltr" }}>
              <span className="text-sm text-ink-2 flex-1 text-left">{text}</span>
              <span className="text-sm text-ink-3">|</span>
              <span className="text-sm text-ink font-medium">{label}</span>
              <Icon size={17} className="text-ink-3 shrink-0" strokeWidth={1.6} />
            </div>
          ))}
        </div>

        {/* Chat row */}
        <div className="bg-paper rounded-2xl px-4 py-3 flex items-center justify-between" style={{ direction: "ltr" }}>
          <button onClick={() => router.push("/messages")} className="text-terracotta font-bold text-base active:opacity-70">לצ׳אט</button>
          <div className="flex items-center gap-2">
            <MessageCircle size={22} className="text-ink-3" strokeWidth={1.6} />
            {conversationCount > 0 && (
              <span className="text-sm text-ink-2">יש לך {conversationCount} שיחות פתוחות</span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="bg-paper rounded-2xl px-4 py-4 flex justify-between">
          {[
            { icon: Trash2, label: "הסרה", action: () => setConfirmRemove(true), danger: true },
            { icon: Share2, label: "שיתוף", action: async () => {
              const url = `${window.location.origin}/jobs/${id}/view`;
              await shareJob(job?.title ?? "משרה ב-Hevre", url);
            }, danger: false },
            { icon: frozen ? PlayCircle : Snowflake, label: frozen ? "החזרה לפעילות" : "הקפאה", action: () => frozen ? handleUnfreeze() : setConfirmFreeze(true), danger: false },
            { icon: Pencil, label: "עריכה", action: () => router.push(`/jobs/${id}/edit`), danger: false },
          ].map(({ icon: Icon, label, action, danger }) => (
            <button key={label} onClick={action} className="flex flex-col items-center gap-1.5 active:opacity-60">
              <Icon size={24} className={danger ? "text-warm-danger" : "text-ink-2"} strokeWidth={1.6} />
              <span className={`text-xs font-medium ${danger ? "text-warm-danger" : "text-ink-3"}`}>{label}</span>
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="bg-paper rounded-2xl px-4 py-4 flex justify-between">
          {[
            { icon: Users, label: "הגישו מועמדות", value: applicants.length },
            { icon: Heart, label: "אהבו את המודעה", value: 0 },
            { icon: Eye, label: "צפו במודעה", value: viewCount },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <Icon size={22} className="text-ink-3" strokeWidth={1.6} />
              <span className="font-serif text-lg font-bold text-ink">{value}</span>
              <span className="text-[10px] text-ink-3 text-center leading-tight max-w-[70px]">{label}</span>
            </div>
          ))}
        </div>

        {/* Applicants */}
        <div className="bg-paper rounded-2xl px-4 py-4 flex flex-col gap-3">
          <p className="font-serif text-base font-bold text-ink text-right tracking-tight">מועמדים</p>

          {/* Pending */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-0.5 text-right">
              <p className="text-xs font-semibold text-terracotta">ממתינים לאישור ({pending.length})</p>
              <p className="text-[10px] text-ink-3">אחרי 48 שעות המועמד יתבטל אוטומטית עקב חוסר מענה</p>
            </div>
            {pending.length === 0
              ? <p className="text-xs text-ink-3 text-right">אין מועמדים בהמתנה</p>
              : pending.map(a => (
                <div key={a.id} className="flex items-center justify-between bg-cream-warm rounded-xl px-3 py-2.5">
                  <button
                    onClick={() => setSelectedApplicant(a)}
                    className="flex items-center gap-1 text-xs font-bold text-terracotta active:opacity-70"
                  >
                    <ChevronLeft size={14} strokeWidth={2.5} />
                    צפה במועמד
                  </button>
                  <span className="text-sm font-medium text-ink">{a.name}</span>
                </div>
              ))}
          </div>

          {/* Approved */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-warm-success text-right">אושרו ({approved.length})</p>
            {approved.length === 0
              ? <p className="text-xs text-ink-3 text-right">אין מועמדים שאושרו</p>
              : approved.map(a => (
                <div key={a.id} className="flex items-center justify-between bg-warm-success-bg rounded-xl px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        await supabase.from("applications").update({ status: "archived" }).eq("id", a.id);
                        await loadApplicants();
                      }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg active:bg-cream"
                    >
                      <Archive size={16} className="text-ink-3" strokeWidth={1.8} />
                    </button>
                    <button
                      onClick={async () => {
                        const { data: conv } = await supabase
                          .from("conversations")
                          .select("id")
                          .eq("job_id", id)
                          .eq("applicant_id", a.applicant_id)
                          .single();
                        if (conv?.id) router.push(`/messages/${conv.id}`);
                        else router.push("/messages");
                      }}
                      className="flex items-center gap-1 text-xs font-bold text-warm-success active:opacity-70"
                    >
                      <MessageCircle size={13} strokeWidth={2} />
                      פתח צ׳אט
                    </button>
                  </div>
                  <span className="text-sm font-medium text-ink">{a.name}</span>
                </div>
              ))}
          </div>

          {/* Archived */}
          {archived.length > 0 && (
            <div className="flex flex-col gap-2">
              <div
                onClick={() => setShowArchivedApplicants(v => !v)}
                className="flex items-center justify-between w-full cursor-pointer"
                style={{ direction: "rtl" }}
              >
                <p className="text-xs font-semibold text-ink-3">ארכיון מאושרים ({archived.length})</p>
                <ChevronDown size={14} className={`text-ink-3 transition-transform ${showArchivedApplicants ? "rotate-180" : ""}`} strokeWidth={2} />
              </div>
              {showArchivedApplicants && archived.map(a => (
                <div key={a.id} className="flex items-center justify-between bg-cream rounded-xl px-3 py-2.5 ring-1 ring-divider">
                  <button
                    onClick={async () => {
                      await supabase.from("applications").update({ status: "approved" }).eq("id", a.id);
                      await loadApplicants();
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-lg active:bg-cream-warm"
                  >
                    <ArchiveRestore size={16} className="text-terracotta" strokeWidth={1.8} />
                  </button>
                  <span className="text-sm font-medium text-ink-2">{a.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Meta */}
        <div className="text-right text-xs text-ink-3 mt-1 flex flex-col gap-0.5">
          {createdDate && <p>מועד יצירה: {createdDate}</p>}
          <p>מספר מודעה: {job.id}</p>
        </div>

      </main>

      <BottomNav />

      {/* Upgrade button */}
      <div className="fixed bottom-16 right-0 left-0 bg-paper border-t border-divider px-4 py-4">
        <button
          onClick={() => router.push(`/upgrade?job=${id}`)}
          className="w-full h-14 bg-terracotta text-cream font-serif font-semibold text-lg rounded-2xl active:opacity-90 transition-opacity"
        >
          שדרוג מודעה ✦
        </button>
      </div>

      {/* Applicant modal */}
      {selectedApplicant && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSelectedApplicant(null)} />
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className="bg-paper rounded-t-3xl w-full px-5 pt-5 pb-10 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-1">
                <button onClick={() => setSelectedApplicant(null)} className="w-9 h-9 flex items-center justify-center rounded-full bg-cream-warm active:bg-cream">
                  <X size={18} className="text-ink-2" strokeWidth={2} />
                </button>
                <div className="w-10 h-1 bg-cream-warm rounded-full" />
                <div className="w-9" />
              </div>

              {/* Profile header */}
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-cream-warm flex items-center justify-center shrink-0 font-serif text-2xl font-bold text-terracotta overflow-hidden">
                  {selectedApplicant.avatar_url
                    ? <Image src={selectedApplicant.avatar_url} alt="" width={56} height={56} className="w-full h-full object-cover" />
                    : selectedApplicant.name[0]}
                </div>
                <div className="flex-1 text-right">
                  <p className="font-serif text-lg font-bold text-ink tracking-tight">{selectedApplicant.name}</p>
                  <div className="flex gap-2 justify-end flex-wrap mt-0.5">
                    {selectedApplicant.age && (
                      <span className="text-xs text-ink-2 bg-cream-warm rounded-full px-2.5 py-1">גיל {selectedApplicant.age}</span>
                    )}
                    {selectedApplicant.gender && (
                      <span className="text-xs text-ink-2 bg-cream-warm rounded-full px-2.5 py-1">{selectedApplicant.gender}</span>
                    )}
                    <span className={`text-xs rounded-full px-2.5 py-1 ${selectedApplicant.license ? "bg-warm-success-bg text-warm-success" : "bg-cream-warm text-ink-3"}`}>
                      {selectedApplicant.license ? "✓ יש רישיון" : "אין רישיון"}
                    </span>
                    {selectedApplicant.country && (
                      <span className="text-xs rounded-full px-2.5 py-1 font-medium bg-cream-warm text-ink-2">
                        {`גר ב${selectedApplicant.country === 'ארה"ב'
                          ? [selectedApplicant.us_state, selectedApplicant.city].filter(Boolean).join(", ") || 'ארה"ב'
                          : selectedApplicant.country}`}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Languages */}
              {selectedApplicant.languages.length > 0 && (
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-semibold text-ink-3 text-right">שפות</p>
                  <div className="flex flex-wrap gap-1.5 justify-end">
                    {selectedApplicant.languages.map(l => (
                      <span key={l} className="text-xs bg-cream-warm text-ink-2 rounded-full px-2.5 py-1 font-medium">{l}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* About self */}
              {selectedApplicant.about_self && (
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-semibold text-ink-3 text-right">על עצמו</p>
                  <p className="text-sm text-ink-2 text-right leading-relaxed bg-cream rounded-xl px-3 py-2.5">{selectedApplicant.about_self}</p>
                </div>
              )}

              {/* Answers */}
              {questions.length > 0 && (
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-semibold text-ink-3 text-right">תשובות לשאלות</p>
                  {questions.map((q, i) => (
                    <div key={i} className="flex flex-col gap-1">
                      <p className="text-xs font-bold text-ink text-right">{q}</p>
                      <p className="text-sm text-ink-2 text-right bg-cream rounded-xl px-3 py-2.5 leading-relaxed">
                        {selectedApplicant.answers[i] || "—"}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Approve / Reject */}
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => handleReject(selectedApplicant)}
                  className="flex-1 h-13 rounded-2xl ring-2 ring-warm-danger text-warm-danger font-serif font-semibold text-base active:bg-warm-danger-bg py-3"
                >
                  דחה
                </button>
                <button
                  onClick={() => handleApprove(selectedApplicant)}
                  className="flex-1 h-13 rounded-2xl bg-ink text-cream font-serif font-semibold text-base active:opacity-90 py-3"
                >
                  אשר ופתח צ׳אט
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Confirm freeze modal */}
      {confirmFreeze && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setConfirmFreeze(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <div className="bg-paper rounded-3xl w-full px-6 py-7 flex flex-col gap-5">
              <h2 className="font-serif text-lg font-bold text-ink text-center tracking-tight">הקפאת מודעה</h2>
              <p className="text-sm text-ink-2 text-center leading-relaxed">אתה בטוח שתרצה להקפיא פרסום מודעה זו?</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmFreeze(false)} className="flex-1 h-12 rounded-2xl ring-1 ring-divider text-ink-2 font-medium">לא</button>
                <button onClick={handleFreeze} className="flex-1 h-12 rounded-2xl bg-ink text-cream font-serif font-semibold active:opacity-90">כן</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Confirm remove modal */}
      {confirmRemove && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setConfirmRemove(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <div className="bg-paper rounded-3xl w-full px-6 py-7 flex flex-col gap-5">
              <h2 className="font-serif text-lg font-bold text-ink text-center tracking-tight">הסרת מודעה</h2>
              <p className="text-sm text-ink-2 text-center">האם אתה בטוח שברצונך להסיר את המודעה?</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmRemove(false)} className="flex-1 h-12 rounded-2xl ring-1 ring-divider text-ink-2 font-medium">ביטול</button>
                <button onClick={handleRemove} className="flex-1 h-12 rounded-2xl bg-warm-danger text-cream font-serif font-semibold active:opacity-90">כן, הסר</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
