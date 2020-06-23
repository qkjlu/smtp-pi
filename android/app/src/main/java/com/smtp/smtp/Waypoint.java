package com.smtp.smtp;
import com.mapbox.geojson.Point;

import androidx.annotation.NonNull;

public class Waypoint implements Comparable {
    double longitude;
    double latitude;
    int ordre;
    Waypoint(double longitude, double latitude, int ordre){
        this.longitude = longitude;
        this.latitude = latitude;
        this.ordre = ordre;
    }
    @Override
    public int compareTo(@NonNull Object o) {
        Waypoint waypoint = (Waypoint) o;
        if(this.ordre < waypoint.ordre) return -1;
        if(this.ordre > waypoint.ordre) return 1;
        return 0;
    }
    public Point getPoint(){
        return Point.fromLngLat(longitude,latitude);
    }
}
