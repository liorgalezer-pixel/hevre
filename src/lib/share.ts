export async function shareJob(title: string, url: string) {
  const isCapacitor = typeof (window as any).Capacitor !== "undefined";

  if (isCapacitor) {
    const text = encodeURIComponent(`${title}\n${url}`);
    const intentUrl = `intent:#Intent;action=android.intent.action.SEND;type=text/plain;S.android.intent.extra.TEXT=${text};S.android.intent.extra.SUBJECT=${encodeURIComponent(title)};end`;
    window.location.href = intentUrl;
  } else if (navigator.share) {
    await navigator.share({ title, url });
  } else {
    await navigator.clipboard.writeText(url);
    alert("הקישור הועתק!");
  }
}
