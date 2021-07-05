package com.smtp.smtp.navigation;

import android.content.Context;
import android.util.Log;

import com.mapbox.api.directions.v5.models.DirectionsResponse;
import com.mapbox.api.directions.v5.models.DirectionsRoute;
import com.mapbox.api.matching.v5.MapboxMapMatching;
import com.mapbox.geojson.Point;
import com.mapbox.services.android.navigation.v5.navigation.NavigationRoute;
import com.smtp.smtp.BuildConfig;
import com.smtp.smtp.R;

import org.jetbrains.annotations.NotNull;

import java.util.List;
import java.util.function.Consumer;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class RouteGetter {
    private String TAG = "RouteGetter";
    private Context ctx;
    private List<Point> roadPoints;

    public  RouteGetter(Context ctx, List<Point> roadPoints){
        this.ctx = ctx;
        this.roadPoints = roadPoints;
    }

    public void getRoute(Consumer<DirectionsRoute> success, Consumer<Throwable> failure) {
        NavigationRoute navRoute = getNavigationRoute();

        navRoute.getRoute(
                new Callback<DirectionsResponse>() {
                    @Override
                    public void onResponse(Call<DirectionsResponse> call, Response<DirectionsResponse> response) {
                        Log.d(TAG, "RouteGetting completed");
                        if (validRouteResponse(response)) {
                            DirectionsRoute route = response.body().routes().get(0);
                            success.accept(route);
                        } else {
                            failure.accept(new Throwable("Route response is invalid!"));
                        }
                    }
                    @Override
                    public void onFailure(Call<DirectionsResponse> call, Throwable throwable) {
                        failure.accept(throwable);
                    }
                });
    }

    @NotNull
    private NavigationRoute getNavigationRoute() {
        Log.d(TAG, "API_URL: " + BuildConfig.API_URL);
        NavigationRoute.Builder builder = getBuilder();
        addWaypointToRouteBuilder(builder);
        return builder.build();
    }

    @NotNull
    private NavigationRoute.Builder getBuilder() {
        return NavigationRoute.builder(ctx)
                    .accessToken("pk." + ctx.getString(R.string.gh_key))
                    .baseUrl(BuildConfig.API_URL)
                    .user("gh")
                    .origin(roadPoints.get(0))
                    .destination(roadPoints.get(roadPoints.size() - 1))
                    .continueStraight(false)
                    .profile("car");
    }

    private void addWaypointToRouteBuilder(NavigationRoute.Builder builder) {
        if (roadPoints.size() > 2) {
            for (int i = 1; i < roadPoints.size() - 1; i++) {
                builder.addWaypoint(roadPoints.get(i));
            }
        }
    }

    private boolean validRouteResponse(Response<DirectionsResponse> response) {
        return response.body() != null && !response.body().routes().isEmpty();
    }
}
