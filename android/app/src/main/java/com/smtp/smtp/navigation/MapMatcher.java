package com.smtp.smtp.navigation;

import android.content.Context;
import android.util.Log;

import com.mapbox.api.directions.v5.DirectionsCriteria;
import com.mapbox.api.directions.v5.models.DirectionsRoute;
import com.mapbox.api.matching.v5.MapboxMapMatching;
import com.mapbox.api.matching.v5.models.MapMatchingResponse;
import com.mapbox.geojson.Point;
import com.mapbox.geojson.utils.PolylineUtils;
import com.smtp.smtp.BuildConfig;
import com.smtp.smtp.R;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.function.Consumer;

import retrofit2.Call;
import retrofit2.Callback;

public class MapMatcher {
    private String TAG = "MapMatcher";
    private Context ctx;
    private DirectionsRoute route;

    public MapMatcher(Context ctx, DirectionsRoute route){
        this.ctx = ctx;
        this.route = route;
    }

    public void getMatch(Consumer<DirectionsRoute> success, Consumer<Throwable> failure) {
        List<Point> pts = PolylineUtils.decode(route.geometry(), 6);
        List<Point> lessThan100_Points = new ArrayList<>();
        int indice = 0;
        lessThan100_Points.add(pts.get(indice));
        for (int i=1; i<99; i++){
            indice = Math.round(i*pts.size()/100);
            lessThan100_Points.add(pts.get(indice));
        }
        lessThan100_Points.add(pts.get(pts.size()-1));
        Log.d(TAG, "Geometry points number: " + lessThan100_Points.size());

        MapboxMapMatching.Builder mapMatchingBuilder = MapboxMapMatching.builder()
                .accessToken(ctx.getString(R.string.mapbox_access_token))
                .baseUrl(BuildConfig.API_URL)
                .steps(true)
                .voiceInstructions(true)
                .bannerInstructions(true)
                .coordinates(lessThan100_Points)
                .profile(DirectionsCriteria.PROFILE_DRIVING_TRAFFIC)
                .overview(DirectionsCriteria.OVERVIEW_FULL)
                .language(Locale.FRENCH);

        mapMatchingBuilder.build().enqueueCall(new Callback<MapMatchingResponse>() {
            @Override
            public void onResponse(Call<MapMatchingResponse> call, retrofit2.Response<MapMatchingResponse> response) {
                Log.d(TAG, "Matching URL: " + response.toString());
                route = response.body().matchings().get(0).toDirectionRoute();
                success.accept(route);
            }

            @Override
            public void onFailure(Call<MapMatchingResponse> call, Throwable t) {
                Log.e(TAG, "Error getting matching: " + t.getLocalizedMessage());
                failure.accept(t);
            }
        });
    }
}
