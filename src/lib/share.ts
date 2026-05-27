export async function shareJob(title: string, url: string) {
  const androidShare = (window as any).AndroidShare;

  if (androidShare) {
    androidShare.share(title, url);
  } else if (navigator.share) {
    await navigator.share({ title, url });
  } else {
    await navigator.clipboard.writeText(url);
    alert("הקישור הועתק!");
  }
}
