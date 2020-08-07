package com.smtp.smtp.navigation;
import com.mapbox.geojson.Point;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

public class Waypoint implements Comparable {
    public double longitude;
    public double latitude;
    public int ordre;
    public Waypoint(double longitude, double latitude, int ordre){
        this.longitude = longitude;
        this.latitude = latitude;
        this.ordre = ordre;
    }
    public Waypoint(double longitude, double latitude){
        this.longitude = longitude;
        this.latitude = latitude;
        ordre = -1;
    }

    @Override
    public int compareTo(@NonNull Object o) {
        Waypoint waypoint = (Waypoint) o;
        if(waypoint.ordre == -1){
            Exception e = new Exception("A waypoint need an order to be compared");
            throw new RuntimeException(e);
        }
        if(this.ordre < waypoint.ordre) return -1;
        if(this.ordre > waypoint.ordre) return 1;
        return 0;
    }

    @Override
    public boolean equals(@Nullable Object obj) {
        Waypoint wp = (Waypoint) obj;
        return (wp.latitude == this.latitude && wp.longitude == this.longitude);
    }

    public Point getPoint(){
        return Point.fromLngLat(longitude,latitude);
    }

    @NonNull
    @Override
    public String toString() {
        return "[Ordre: " + ordre + ", Lng: " + longitude + ", Lat: " + latitude + "]";
    }
}
