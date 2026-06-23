#!/usr/bin/env python3
"""
Fetch today's biometric data from Garmin Connect.
Reads GARMIN_EMAIL and GARMIN_PASSWORD from environment variables.
Prints a JSON object to stdout.
"""

import json
import os
import sys
from datetime import date, timedelta

try:
    from garminconnect import Garmin
except ImportError:
    print(json.dumps({"error": "garminconnect not installed. Run: pip3 install garminconnect"}))
    sys.exit(1)

email = os.environ.get("GARMIN_EMAIL")
password = os.environ.get("GARMIN_PASSWORD")

if not email or not password:
    print(json.dumps({"error": "GARMIN_EMAIL and GARMIN_PASSWORD environment variables must be set"}))
    sys.exit(1)

today = date.today().isoformat()
yesterday = (date.today() - timedelta(days=1)).isoformat()

try:
    api = Garmin(email, password)
    api.login()
except Exception as e:
    print(json.dumps({"error": f"Garmin login failed: {str(e)}"}))
    sys.exit(1)

result = {"date": today}

# HRV (last night)
try:
    hrv_data = api.get_hrv_data(today)
    if hrv_data and "hrvSummary" in hrv_data:
        s = hrv_data["hrvSummary"]
        result["hrv"] = {
            "value": s.get("lastNight"),
            "weekly_avg": s.get("weeklyAvg"),
            "baseline_low": s.get("baselineLowUpper"),
            "baseline_high": s.get("baselineBalancedLow"),
            "status": s.get("status"),
        }
    else:
        result["hrv"] = None
except Exception as e:
    result["hrv"] = {"error": str(e)}

# Sleep (last night)
try:
    sleep_data = api.get_sleep_data(today)
    if sleep_data and "dailySleepDTO" in sleep_data:
        s = sleep_data["dailySleepDTO"]
        total_seconds = s.get("sleepTimeSeconds", 0)
        scores = s.get("sleepScores") or {}
        result["sleep"] = {
            "hours": round(total_seconds / 3600, 1),
            "score": scores.get("overall", {}).get("value") if isinstance(scores.get("overall"), dict) else scores.get("overall"),
            "deep_seconds": s.get("deepSleepSeconds"),
            "rem_seconds": s.get("remSleepSeconds"),
        }
    else:
        result["sleep"] = None
except Exception as e:
    result["sleep"] = {"error": str(e)}

# Resting HR
try:
    hr_data = api.get_heart_rates(today)
    if hr_data:
        result["resting_hr"] = hr_data.get("restingHeartRate")
    else:
        result["resting_hr"] = None
except Exception as e:
    result["resting_hr"] = {"error": str(e)}

# Training Readiness
try:
    tr_data = api.get_training_readiness(today)
    if tr_data and isinstance(tr_data, list) and len(tr_data) > 0:
        tr = tr_data[0]
        result["training_readiness"] = {
            "score": tr.get("score"),
            "level": tr.get("level"),
            "contributing_factors": tr.get("contributingFactors"),
        }
    elif tr_data and isinstance(tr_data, dict):
        result["training_readiness"] = {
            "score": tr_data.get("score"),
            "level": tr_data.get("level"),
        }
    else:
        result["training_readiness"] = None
except Exception as e:
    result["training_readiness"] = {"error": str(e)}

# Body Battery
try:
    bb_data = api.get_body_battery(today)
    if bb_data and isinstance(bb_data, list) and len(bb_data) > 0:
        values = [v[1] for v in bb_data[0].get("bodyBatteryValuesArray", []) if v[1] is not None]
        result["body_battery"] = {
            "current": values[-1] if values else None,
            "high": max(values) if values else None,
            "low": min(values) if values else None,
        }
    else:
        result["body_battery"] = None
except Exception as e:
    result["body_battery"] = {"error": str(e)}

# Yesterday's activities
try:
    activities = api.get_activities_by_date(yesterday, yesterday)
    if activities:
        run = next((a for a in activities if "running" in a.get("activityType", {}).get("typeKey", "").lower()), None)
        act = run or activities[0]
        speed = act.get("averageSpeed") or 0
        result["yesterday_activity"] = {
            "type": act.get("activityType", {}).get("typeKey", "unknown"),
            "distance_km": round((act.get("distance") or 0) / 1000, 2),
            "duration_min": round((act.get("duration") or 0) / 60, 1),
            "avg_hr": act.get("averageHR"),
            "max_hr": act.get("maxHR"),
            "calories": act.get("calories"),
            "avg_pace_min_km": round(1000 / speed / 60, 2) if speed > 0 else None,
        }
    else:
        result["yesterday_activity"] = None
except Exception as e:
    result["yesterday_activity"] = {"error": str(e)}

print(json.dumps(result, indent=2))
