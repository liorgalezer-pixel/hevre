package com.hevre.app;

import android.content.Intent;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;
import com.capacitorjs.plugins.browser.BrowserPlugin;
import com.capacitorjs.plugins.app.AppPlugin;
import com.capacitorjs.plugins.share.SharePlugin;
import com.capacitorjs.plugins.pushnotifications.PushNotificationsPlugin;
import com.codetrixstudio.capacitor.GoogleAuth.GoogleAuth;

public class MainActivity extends BridgeActivity {

  class AndroidShare {
    @JavascriptInterface
    public void share(String title, String url) {
      Intent intent = new Intent(Intent.ACTION_SEND);
      intent.setType("text/plain");
      intent.putExtra(Intent.EXTRA_SUBJECT, title);
      intent.putExtra(Intent.EXTRA_TEXT, url);
      startActivity(Intent.createChooser(intent, "שתף משרה"));
    }
  }

  @Override
  public void onCreate(Bundle savedInstanceState) {
    registerPlugin(BrowserPlugin.class);
    registerPlugin(AppPlugin.class);
    registerPlugin(SharePlugin.class);
    registerPlugin(PushNotificationsPlugin.class);
    registerPlugin(GoogleAuth.class);
    super.onCreate(savedInstanceState);

    WebView webView = getBridge().getWebView();
    webView.addJavascriptInterface(new AndroidShare(), "AndroidShare");
  }
}
