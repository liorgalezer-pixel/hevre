package com.hevre.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.capacitorjs.plugins.browser.BrowserPlugin;
import com.capacitorjs.plugins.app.AppPlugin;
import com.capacitorjs.plugins.share.SharePlugin;
import com.codetrixstudio.capacitor.GoogleAuth.GoogleAuth;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    registerPlugin(BrowserPlugin.class);
    registerPlugin(AppPlugin.class);
    registerPlugin(SharePlugin.class);
    registerPlugin(GoogleAuth.class);
    super.onCreate(savedInstanceState);
  }
}
