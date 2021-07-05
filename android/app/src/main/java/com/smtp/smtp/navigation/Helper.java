package com.smtp.smtp.navigation;
import android.location.Location;

import com.mapbox.mapboxsdk.geometry.LatLng;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class Helper {
    public static String getDayString(){
        Date date = new Date();
        DateFormat formatter = new SimpleDateFormat("EEEE", Locale.FRANCE);
        return formatter.format(date);
    }

    public static float distance(LatLng firstPosition, LatLng secondPosition) {
        float[] distanceFromDestination = new float[3];
        Location.distanceBetween(
                firstPosition.getLatitude(),
                firstPosition.getLongitude(),
                secondPosition.getLatitude(),
                secondPosition.getLongitude(),
                distanceFromDestination
        );
        return distanceFromDestination[0];
    }
}
