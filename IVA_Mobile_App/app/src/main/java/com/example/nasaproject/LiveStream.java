package com.example.nasaproject;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
/*
The Android fragment that holds where the button calls to in the main menu
Due to the way Twitch.tv's API works we cannot use an embeded stream in the application, unless it was a web application
The only way to achieve this is to create your own streaming application and doing the embeding yourself.


TODO: Create streaming application that can be embeded into application
So we don't have to rely on #1 the internet which will have delays on the moon/mars and #2 so we don't have to rely on 3rd party applications
 */
public class LiveStream extends Fragment {

    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_live_stream, container, false);

           }
}
