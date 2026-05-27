export async function shareJob(title: string, url: string) {
  const isCapacitor = typeof (window as any).Capacitor !== "undefined";
  alert("shareJob called, isCapacitor=" + isCapacitor);

  if (isCapacitor) {
    try {
      const { Share } = await import("@capacitor/share");
      await Share.share({ title, url, dialogTitle: "שתף משרה" });
    } catch (e: any) {
      alert("Share error: " + e?.message);
    }
  } else if (navigator.share) {
    await navigator.share({ title, url });
  } else {
    await navigator.clipboard.writeText(url);
    alert("הקישור הועתק!");
  }
}
