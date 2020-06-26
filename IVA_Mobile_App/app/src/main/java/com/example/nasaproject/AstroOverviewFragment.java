package com.example.nasaproject;

import android.os.AsyncTask;
import android.os.Bundle;

import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentTransaction;

import android.os.CountDownTimer;
import android.os.Handler;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.InputStream;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Scanner;
import java.util.concurrent.TimeUnit;


/**
 A simple android fragment that allows for monitoring of multiple telemetry streams via api calls on different ports
 FIXME: Fix timer restarting on app close/restart
 TODO: add setting to input expected mission time by user
 TODO: find a way to get the data to refresh faster runnable seems to have 20,000 millisecond delay limit as fastest
 */
public class AstroOverviewFragment extends Fragment {

    private static final String ARG_PARAM1 = "param1";
    private static final String ARG_PARAM2 = "param2";


    private final String URL = "http://192.168.1.10:8002/telemetry";
    private final String URL2 = "http://192.168.1.10:8001/telemetry";

    private static TextView Oxygen;
    private static TextView Battery;
    private static TextView OxygenRate;
    private static TextView Oxygen2;
    private static TextView Battery2;
    private static TextView OxygenRate2;
    public static TextView Time;
    public static TextView Time2;
    public long millis;
    public long millis2;

    private Button detailsButton;

    public long timeRemaining;

    CountDownTimer countDownTimer;
    CountDownTimer countDownTimer2;



    protected Handler handler = new Handler();

    public void useAPI(String URL){
        System.gc();
        new GetFromAPI().execute(URL);
    }



    public AstroOverviewFragment() {
        // Required empty public constructor
    }


    public static AstroOverviewFragment newInstance(String param1, String param2) {
        AstroOverviewFragment fragment = new AstroOverviewFragment();
        Bundle args = new Bundle();
        args.putString(ARG_PARAM1, param1);
        args.putString(ARG_PARAM2, param2);
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public void onPause(){
        System.gc();
        countDownTimer.cancel();
        countDownTimer2.cancel();
        super.onPause();
    }

    @Override
    public void onResume(){

        if(millis > 0){
            countDownTimer = new CountDownTimer(millis, 1000){
                public void onTick(long millisUntilFinished) {
                    Time.setText(String.format("%02d:%02d:%02d",
                            TimeUnit.MILLISECONDS.toHours(millisUntilFinished) % 60,
                            TimeUnit.MILLISECONDS.toMinutes(millisUntilFinished)% 60,
                            TimeUnit.MILLISECONDS.toSeconds(millisUntilFinished) %60
                    ));
                    millis = millisUntilFinished;
                   // Log.i("TIMER",Long.toString(millisUntilFinished));
                }


                public void onFinish() {
                    Time.setText("done!");
                }

            }.start();
        }

        /*else {
            countDownTimer = new CountDownTimer(millis, 1000){
                public void onTick(long millisUntilFinished) {
                    Time.setText(String.format("%02d:%02d:%02d",
                            TimeUnit.MILLISECONDS.toHours(millisUntilFinished) % 60,
                            TimeUnit.MILLISECONDS.toMinutes(millisUntilFinished)% 60,
                            TimeUnit.MILLISECONDS.toSeconds(millisUntilFinished) %60
                    ));
                    millis = millisUntilFinished;
                }


                public void onFinish() {
                    Time.setText("done!");
                }

            }.start();
        } */

        super.onResume();

    }

    @Override
    public void onStart(){

        super.onStart();
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);


    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View rootView = inflater.inflate(R.layout.fragment_astro_overview, container, false);

        //gives us mission duration in from hours to milliseconds
        millis = TimeUnit.HOURS.toMillis(8);
        millis2 = TimeUnit.HOURS.toMillis(5);

        new GetFromAPI().execute(URL);
        new GetFromAPI2().execute(URL2);

        Oxygen = rootView.findViewById(R.id.Oxygen);
        Battery = rootView.findViewById(R.id.battery);
        OxygenRate = rootView.findViewById(R.id.Pressure);
        Time = rootView.findViewById(R.id.beat);
        detailsButton = rootView.findViewById(R.id.btnMore);
        Oxygen2 = rootView.findViewById(R.id.Oxygen2);
        Battery2 = rootView.findViewById(R.id.battery2);
        OxygenRate2 = rootView.findViewById(R.id.Pressure2);
        Time2 = rootView.findViewById(R.id.beat2);


        handler.postDelayed(runnable, 10000);

        detailsButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Fragment myFrag = new singleAstro();
                FragmentTransaction transaction = getFragmentManager().beginTransaction();
                transaction.replace(R.id.fragment_container, myFrag);
                transaction.addToBackStack(null);
                transaction.commit();
            }
        });

        countDownTimer2 = new CountDownTimer(millis2, 1000){
            public void onTick(long millisUntilFinished) {
                Time2.setText(String.format("%02d:%02d:%02d",
                        TimeUnit.MILLISECONDS.toHours(millisUntilFinished) % 60,
                        TimeUnit.MILLISECONDS.toMinutes(millisUntilFinished)% 60,
                        TimeUnit.MILLISECONDS.toSeconds(millisUntilFinished) %60
                ));
                millis2 = millisUntilFinished;
                // Log.i("TIMER",Long.toString(millisUntilFinished));
            }


            public void onFinish() {
                Time2.setText("done!");
            }

        }.start();



        // Inflate the layout for this fragment
        return rootView;


    }
    // A method for refreshing the telemetry stream data

    private Runnable runnable = new Runnable() {
        @Override
        public void run() {

            try {
                new GetFromAPI().execute(URL);

                handler.postDelayed(this, 20000);
            } catch (Exception e) {
                Log.e("API Call", e.toString());
            }
        }
    };






    //The class we use to get the telemetry data from our local telemetry server
    private class GetFromAPI extends AsyncTask<String, Void, String> {
        private String jsonResponse = "";
        private int oxygen;
        private int battery;
        private String oxygenrate;
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


                JSONObject jsonObject = new JSONObject(jsonResponse);

                //the json data does not come as a json array so we use jsonObjects to get each value in each object
                //not the jsonobject out of an array which was the original approach
                JSONObject jsonOxygen = jsonObject.getJSONObject("2");
                oxygen = jsonOxygen.getInt("value");

                JSONObject jsonBattery = jsonObject.getJSONObject("4");
                battery = jsonBattery.getInt("value");

                JSONObject jsonOxygenRate = jsonObject.getJSONObject("3");
                oxygenrate = jsonOxygenRate.getString("value");





            }catch(Exception e){
                Log.e("API Call", e.toString());
            }

            return "API Call Complete";
        }
        protected void onPostExecute(String result) {
            Log.i("API Call", "Result: " + result);

            Oxygen.setText("Oxygen Pressure: " + (oxygen) + " psia");
            Battery.setText("Battery Usage: " + (battery) + " amp-hr");
            OxygenRate.setText("Oxygen Flow Rate: " + (oxygenrate) + " psi/min");
        }
    }
    //we have to use multithreading for additional astronauts as we can't update different values from a single call
    //so we use two async tasks to get the job done
    private class GetFromAPI2 extends AsyncTask<String, Void, String> {
        private String jsonResponse = "";
        private int oxygen;
        private int battery;
        private String oxygenrate;
        @Override
        protected String doInBackground(String... strings){
            String request = strings[0];


            Log.i("Api Call2","Request: " + request);

            try {
                Log.i("API Call2", "Initiating Call");

                java.net.URL url = new URL(request);
                url.openConnection().setConnectTimeout(6000);

                InputStream in = url.openStream();
                Scanner streamInput = new Scanner(in, StandardCharsets.UTF_8.name());

                jsonResponse = streamInput.nextLine();

                streamInput.close();
                in.close();

                //JSONArray arrayData = new JSONArray(jsonResponse);

                JSONObject jsonObject = new JSONObject(jsonResponse);

                JSONObject jsonOxygen = jsonObject.getJSONObject("2");
                oxygen = jsonOxygen.getInt("value");

                JSONObject jsonBattery = jsonObject.getJSONObject("4");
                battery = jsonBattery.getInt("value");

                JSONObject jsonOxygenRate = jsonObject.getJSONObject("3");
                oxygenrate = jsonOxygenRate.getString("value");





            }catch(Exception e){
                Log.e("API Call2", e.toString());
            }

            return "API Call Complete";
        }
        protected void onPostExecute(String result) {
            Log.i("API Call2", "Result: " + result);

            Oxygen2.setText("Oxygen Pressure: " + (oxygen) + " psia");
            Battery2.setText("Battery Usage: " + (battery) + " amp-hr");
            OxygenRate2.setText("Oxygen Flow Rate: " + (oxygenrate) + " psi/min");
        }
    }
}
