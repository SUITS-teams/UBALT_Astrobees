package com.example.nasaproject;

import android.os.AsyncTask;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import org.json.JSONObject;

import java.io.InputStream;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Scanner;

public class field extends Fragment {
    private TextView Date;
    private TextView Location;
    private TextView Description;
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View rootView =  inflater.inflate(R.layout.fragment_field, container, false);
        //will hold field notes for app
        Date = rootView.findViewById(R.id.dateTime);
        Location = rootView.findViewById(R.id.sampleLoc);
        Description = rootView.findViewById(R.id.sampleDesc);

        new GetFromAPI().execute("http://192.168.1.10:8002/messages");


        return rootView;


    }

    private class GetFromAPI extends AsyncTask<String, Void, String> {
        private String jsonResponse = "";
        private String dateTime;
        private String location;
        private String description;
        @Override
        protected String doInBackground(String... strings){
            String request = strings[0];


            Log.i("Api Call","Request: " + request);

            try {
                Log.i("API Call", "Initiating Call");

                java.net.URL url = new URL(request);
                url.openConnection().setConnectTimeout(6000);

                InputStream in = url.openStream();
                Scanner streamInput = new Scanner(in, StandardCharsets.UTF_8.name());

                jsonResponse = streamInput.nextLine();

                streamInput.close();
                in.close();

                //JSONArray arrayData = new JSONArray(jsonResponse);

                JSONObject jsonObject = new JSONObject(jsonResponse);

                dateTime = jsonObject.getString("date");
                location = jsonObject.getString("location");
                description = jsonObject.getString("Description");



            }catch(Exception e){
                Log.e("API Call", e.toString());
            }

            return "API Call Complete";
        }
        protected void onPostExecute(String result) {
            Log.i("API Call", "Result: " + result);

            Date.setText(String.valueOf(dateTime));
            Location.setText(String.valueOf(location));
            Description.setText(String.valueOf(description));
        }
    }
}
