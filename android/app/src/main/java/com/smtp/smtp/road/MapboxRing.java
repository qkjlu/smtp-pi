package com.smtp.smtp.road;

import android.graphics.Color;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.mapbox.geojson.LineString;
import com.mapbox.geojson.Point;
import com.mapbox.geojson.Polygon;
import com.mapbox.mapboxsdk.maps.Style;
import com.mapbox.mapboxsdk.style.layers.FillLayer;
import com.mapbox.mapboxsdk.style.sources.GeoJsonSource;
import com.mapbox.turf.TurfMeta;
import com.mapbox.turf.TurfTransformation;

import static com.mapbox.mapboxsdk.style.layers.PropertyFactory.fillColor;
import static com.mapbox.turf.TurfConstants.UNIT_METERS;

public class MapboxRing {
    private Point center;
    private Integer radius;
    private String sourceId;
    private String layerId;
    private GeoJsonSource source;
    private FillLayer layer;
    private int color;
    private int meterDifferenceBetweenCircles;

    MapboxRing(Point center, Integer radius, String sourceId, String layerId, Integer meterDifferenceBetweenCircles) {
        this.center = center;
        this.radius = radius;
        this.sourceId = sourceId;
        this.layerId = layerId;
        this.color = Color.argb(125, 255, 0, 0);
        this.source = new GeoJsonSource(sourceId);
        this.layer = new FillLayer(layerId, this.sourceId).withProperties(fillColor(color));
        this.meterDifferenceBetweenCircles = meterDifferenceBetweenCircles;

        computeSource();
    }

    private void computeSource(){
        Polygon outerCirclePolygon = getTurfPolygonCircle(radius + this.meterDifferenceBetweenCircles, center);
        Polygon innerCirclePolygon = getTurfPolygonCircle(
                radius, center);
        if (source != null) {
            source.setGeoJson(Polygon.fromOuterInner(
                    LineString.fromLngLats(TurfMeta.coordAll(outerCirclePolygon, false)),
                    LineString.fromLngLats(TurfMeta.coordAll(innerCirclePolygon, false))
            ));
        }
    }

    public void addToStyle(Style style){
        style.addSource(this.source);
        style.addLayer(this.layer);
    }

    static Polygon getTurfPolygonCircle(@NonNull double radius, @NonNull Point centerPoint) {
        return TurfTransformation.circle(centerPoint, radius, 360, UNIT_METERS);
    }


}
