package com.smtp.smtp.navigation;

import android.content.Context;
import android.util.Log;

import com.mapbox.api.directions.v5.DirectionsCriteria;
import com.mapbox.api.directions.v5.models.DirectionsRoute;
import com.mapbox.api.directions.v5.models.LegAnnotation;
import com.mapbox.api.directions.v5.models.LegStep;
import com.mapbox.api.directions.v5.models.RouteLeg;
import com.mapbox.api.directions.v5.models.RouteOptions;
import com.mapbox.api.matching.v5.MapboxMapMatching;
import com.mapbox.api.matching.v5.models.MapMatchingResponse;
import com.mapbox.geojson.Point;
import com.mapbox.geojson.utils.PolylineUtils;
import com.smtp.smtp.BuildConfig;
import com.smtp.smtp.R;

import org.jetbrains.annotations.NotNull;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.function.Consumer;
import java.util.stream.Collectors;

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
        for (int i=0; i<100; i++){
            indice = Math.round(i*pts.size()/100);
            lessThan100_Points.add(pts.get(indice));
        }
        Log.d(TAG, "Geometry points number: " + lessThan100_Points.size());

        MapboxMapMatching.Builder mapMatchingBuilder = MapboxMapMatching.builder()
                .accessToken(ctx.getString(R.string.mapbox_access_token))
                .baseUrl(BuildConfig.API_URL)
                .steps(true)
                .voiceInstructions(true)
                .bannerInstructions(true)
                .coordinates(pts)
                .profile(DirectionsCriteria.PROFILE_DRIVING_TRAFFIC)
                .tidy(true)
                .language(Locale.FRENCH);

        mapMatchingBuilder.build().enqueueCall(new Callback<MapMatchingResponse>() {
            @Override
            public void onResponse(Call<MapMatchingResponse> call, retrofit2.Response<MapMatchingResponse> response) {
                Log.d(TAG, "Matching URL: " + response.toString());
                route = response.body().matchings().get(0).toDirectionRoute();
                //route = flattenRoute(route);
                success.accept(route);
            }

            @Override
            public void onFailure(Call<MapMatchingResponse> call, Throwable t) {
                Log.e(TAG, "Error getting matching: " + t.getLocalizedMessage());
                failure.accept(t);
            }
        });
    }

    private DirectionsRoute flattenRoute(final DirectionsRoute route) {
        List<RouteLeg> oneLeg = new ArrayList<>();
        List<LegStep> allSteps = getJoinedAllLegStepsOfRoute(route);
        RouteLeg leg = buildRouteLegFromExistingRoute(route, allSteps);
        oneLeg.add(leg);
        return buildRouteFromExistingRoute(route, leg);
    }

    private DirectionsRoute buildRouteFromExistingRoute(DirectionsRoute route, RouteLeg leg) {
        DirectionsRoute directionsRoute = new DirectionsRoute() {
            @Override
            public String routeIndex() {
                return route.routeIndex();
            }

            @Override
            public Double distance() {
                return leg.distance();
            }

            @Override
            public Double duration() {
                return leg.duration();
            }

            @Override
            public String geometry() {
                return route.geometry();
            }

            @Override
            public Double weight() {
                return route.weight();
            }

            @Override
            public String weightName() {
                return route.weightName();
            }

            @Override
            public List<RouteLeg> legs() {
                List<RouteLeg> res = new ArrayList<>();
                res.add(leg);
                return res;
            }

            @Override
            public RouteOptions routeOptions() {
                return route.routeOptions();
            }

            @Override
            public String voiceLanguage() {
                return route.voiceLanguage();
            }

            @Override
            public Builder toBuilder() {
                return route.toBuilder();
            }
        };
        return directionsRoute;
    }

    @NotNull
    private List<LegStep> getJoinedAllLegStepsOfRoute(DirectionsRoute route) {
        List<LegStep> allRouteSteps = new ArrayList<>();
        route.legs()
                .stream()
                .forEach(routeLeg -> allRouteSteps.addAll(routeLeg.steps()));
        return allRouteSteps;
    }

    private RouteLeg buildRouteLegFromExistingRoute(DirectionsRoute route, List<LegStep> allRouteSteps) {
        RouteLeg leg = new RouteLeg() {
            @Override
            public Double distance() {
                return allRouteSteps.stream().collect(Collectors.summingDouble(value -> value.distance()));
            }

            @Override
            public Double duration() {
                return allRouteSteps.stream().collect(Collectors.summingDouble(value -> value.duration()));
            }

            @Override
            public String summary() {
                return route.legs().get(0).summary();
            }

            @Override
            public List<LegStep> steps() {
                return allRouteSteps;
            }

            @Override
            public LegAnnotation annotation() {
                return route.legs().get(0).annotation();
            }

            @Override
            public Builder toBuilder() {
                return route.legs().get(0).toBuilder();
            }
        };
        return leg;
    }
}
