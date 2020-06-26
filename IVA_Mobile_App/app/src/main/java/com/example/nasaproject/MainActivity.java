package com.example.nasaproject;

import android.content.Intent;
import android.os.AsyncTask;
import android.os.Bundle;
import android.util.Log;
import android.view.MenuItem;
import android.view.View;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Button;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.appcompat.app.ActionBarDrawerToggle;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.core.view.GravityCompat;
import androidx.drawerlayout.widget.DrawerLayout;
import androidx.fragment.app.Fragment;

import com.google.android.material.navigation.NavigationView;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.InputStream;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Scanner;
/*
The main activity of the application
Holds Menu information
Allows user to navigate between sections
Displays initial overview fragment

TODO: Incorporate Rover fragment
TODO: Add EVA mission overview fragment
 */
public class MainActivity extends AppCompatActivity implements NavigationView.OnNavigationItemSelectedListener {
    private static String pass;
    private DrawerLayout drawer;
    private Button moreButton;

    private final String URL = "http://192.168.1.10:8002/test";

    private TextView Oxygen;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        Toolbar toolbar = findViewById(R.id.toolbar);




        drawer = findViewById(R.id.drawer_layout);
        NavigationView navigationView = findViewById(R.id.nav_view);
        navigationView.setNavigationItemSelectedListener(this);
        ActionBarDrawerToggle toggle = new ActionBarDrawerToggle(this, drawer, toolbar,
                R.string.navigation_drawer_open, R.string.navigation_drawer_close);
        drawer.addDrawerListener(toggle);
        toggle.syncState();
        getSupportFragmentManager().beginTransaction().replace(R.id.fragment_container, new AstroOverviewFragment()).commit();
        /*moreButton = findViewById(R.id.btnMore);
        //pressureButton.setText(Help);
        moreButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                Intent i = new Intent (MainActivity.this, singleAstro.class);

                startActivity(i);
            }

        });*/

    }



    @Override
    public boolean onNavigationItemSelected(@NonNull MenuItem menuItem) {
        Log.i("MainActivity", "Menu choice made:");
        switch(menuItem.getItemId()) {
            case R.id.main:
                getSupportFragmentManager().beginTransaction().replace(R.id.fragment_container, new AstroOverviewFragment()).commit();
                Log.i("MainActivity", "Main fragment");
                AstroOverviewFragment astro = new AstroOverviewFragment();
                //input whatever ip/api the telemetry server runs on
                //TODO: create settings menu that allows for manual entry of IP/API
                astro.useAPI("http://192.168.1.10:8002/telemetry");
                break;
            //case R.id.details:
                //getSupportFragmentManager().beginTransaction().replace(R.id.fragment_container, new details()).commit();
               // Log.i("MainActivity", "Details fragment");
                //break;
            case R.id.field:
                getSupportFragmentManager().beginTransaction().replace(R.id.fragment_container, new field()).commit();
                break;
            //case R.id.rover:
                //getSupportFragmentManager().beginTransaction().replace(R.id.fragment_container, new rover()).commit();
                //break;
            case R.id.single:
                getSupportFragmentManager().beginTransaction().replace(R.id.fragment_container, new singleAstro()).commit();
                break;
            //connect to ubalt astrobees twitch stream
            //uses default browser if one is set, if not asks for browser
            case R.id.Stream:
                getSupportFragmentManager().beginTransaction().replace(R.id.fragment_container, new LiveStream()).commit();
                String url = "https://www.twitch.tv/ubaltastrobees";
                WebView webView;
                webView = (WebView) findViewById(R.id.webview1);
                webView.setWebChromeClient(new WebChromeClient());
                WebSettings webSettings = webView.getSettings();
                webSettings.setJavaScriptEnabled(false);
                webSettings.setUseWideViewPort(true);
                webSettings.setLoadWithOverviewMode(true);
                webView.loadUrl(url);


                break;
            //case R.id.main:
              //  getSupportFragmentManager().beginTransaction().replace( new MainActivity()).commit();
             //   break;

        }
        drawer.closeDrawer(GravityCompat.START);
        return true;
    }

    public void onBackPressed() {
        if (drawer.isDrawerOpen(GravityCompat.START)) {
            drawer.closeDrawer(GravityCompat.START);
        } else {
            super.onBackPressed();
        }
    }
}
