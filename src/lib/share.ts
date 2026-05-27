export async function shareJob(title: string, url: string) {
  const isCapacitor = typeof (window as any).Capacitor !== "undefined";

  if (isCapacitor) {
    const { Share } = await import("@capacitor/share");
    await Share.share({ title, url, dialogTitle: "שתף משרה" });
  } else if (navigator.share) {
    await navigator.share({ title, url });
  } else {
    await navigator.clipboard.writeText(url);
    alert("הקישור הועתק!");
  }
}
