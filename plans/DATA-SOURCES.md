# K-Monitor Data Sources

## 1. 기상청 지진정보 (Earthquake)

**Portal**: https://www.data.go.kr/data/15000420/openapi.do
**Base URL**: `http://apis.data.go.kr/1360000/EqkInfoService`

### Endpoints
- `/getEqkMsg` — 지진통보 (earthquake notifications)

### Parameters
| Param | Required | Example | Description |
|-------|----------|---------|-------------|
| serviceKey | Y | (API key) | data.go.kr 인증키 |
| numOfRows | N | 10 | Results per page |
| pageNo | N | 1 | Page number |
| dataType | N | JSON | Response format (JSON/XML) |
| fromTmFc | N | 20260401 | Start date (YYYYMMDD) |
| toTmFc | N | 20260410 | End date (YYYYMMDD) |

### Sample Request
```
http://apis.data.go.kr/1360000/EqkInfoService/getEqkMsg?serviceKey=KEY&numOfRows=10&pageNo=1&dataType=JSON
```

### Response Fields
```json
{
  "response": {
    "header": { "resultCode": "00", "resultMsg": "NORMAL_SERVICE" },
    "body": {
      "items": {
        "item": [
          {
            "cnt": 1,
            "fcTp": 2,
            "img": "...",
            "inT": "외해",
            "lat": "35.77",
            "lon": "129.18",
            "loc": "경북 경주시 남남서쪽 8km 지역",
            "mt": "3.5",
            "dep": "12",
            "tmFc": "20260410153000",
            "tmSeq": 1
          }
        ]
      },
      "totalCount": 1
    }
  }
}
```

### Field Mapping
| API Field | Entity Field | Type |
|-----------|-------------|------|
| tmFc | externalId | String (datetime key) |
| mt | magnitude | Double |
| dep | depth | Integer |
| lat | latitude | Double |
| lon | longitude | Double |
| loc | locationName | String |
| tmFc | occurredAt | LocalDateTime (parse YYYYMMDDHHMMSS) |

### Rate Limit
- 10,000 calls/month (free tier)
- Fetch interval: every 5 minutes = ~8,640 calls/month (within limit)

---

## 2. 행정안전부 재난문자 (Disaster Alerts)

**Old API (deprecated)**: https://www.data.go.kr/dataset/3058822/openapi.do
**New API**: https://www.data.go.kr/data/15134001/openapi.do
**Safety Platform**: https://www.safetydata.go.kr/disaster-data/view?dataSn=228
**Base URL (old)**: `http://apis.data.go.kr/1741000/DisasterMsg4/getDisasterMsg2List`

> NOTE: Old API being deprecated. New API provides data from 2023+. Try old first, migrate to new if needed.

### Parameters
| Param | Required | Example | Description |
|-------|----------|---------|-------------|
| serviceKey | Y | (API key) | data.go.kr 인증키 |
| numOfRows | N | 10 | Results per page |
| pageNo | N | 1 | Page number |
| type | N | json | Response format |

### Response Fields
```json
{
  "DisasterMsg": [
    {
      "head": [{ "totalCount": 100 }, { "numOfRows": 10 }]
    },
    {
      "row": [
        {
          "create_date": "2026/04/10 14:00:00",
          "location_id": "101",
          "location_name": "서울특별시",
          "md101_sn": "12345",
          "msg": "오늘 18시부터 내일 06시까지 서울, 경기북부에 시간당 30mm 이상의 강한 비..."
        }
      ]
    }
  ]
}
```

### Field Mapping
| API Field | Entity Field | Type |
|-----------|-------------|------|
| md101_sn | externalId | String |
| msg | message | String |
| location_name | regionName | String |
| create_date | issuedAt | LocalDateTime |
| (parsed from msg) | category | String |
| (parsed from msg) | severity | String |

### Notes
- Category and severity must be parsed from message text
- Keywords: 지진 → earthquake, 태풍 → typhoon, 호우 → heavy rain, 대설 → heavy snow, 한파 → cold wave, 미세먼지 → fine dust, 폭염 → heat wave

---

## 3. 에어코리아 대기오염정보 (Air Quality)

**Portal**: https://www.data.go.kr/data/15073861/openapi.do
**Base URL**: `http://apis.data.go.kr/B552584/ArpltnInforInqireSvc`

### Endpoints
- `/getCtprvnRltmMesureDnsty` — 시도별 실시간 측정정보
- `/getMsrstnAcctoRltmMesureDnsty` — 측정소별 실시간 측정정보

### Parameters (시도별)
| Param | Required | Example | Description |
|-------|----------|---------|-------------|
| serviceKey | Y | (API key) | data.go.kr 인증키 |
| returnType | N | json | Response format |
| numOfRows | N | 100 | Results per page |
| pageNo | N | 1 | Page number |
| sidoName | Y | 서울 | 시도명 (서울, 부산, 대구, 인천, 광주, 대전, 울산, 세종, 경기, 강원, 충북, 충남, 전북, 전남, 경북, 경남, 제주) |
| ver | N | 1.3 | API version |

### Response Fields
```json
{
  "response": {
    "body": {
      "items": [
        {
          "stationName": "종로구",
          "dataTime": "2026-04-10 15:00",
          "pm10Value": "45",
          "pm25Value": "22",
          "o3Value": "0.035",
          "no2Value": "0.028",
          "coValue": "0.5",
          "so2Value": "0.004",
          "khaiValue": "63",
          "khaiGrade": "2",
          "pm10Grade": "2",
          "pm25Grade": "2"
        }
      ]
    }
  }
}
```

### Grade Mapping
| Grade | Label | Color |
|-------|-------|-------|
| 1 | 좋음 | Green |
| 2 | 보통 | Yellow |
| 3 | 나쁨 | Orange |
| 4 | 매우나쁨 | Red |

### Station Coordinates
- AirKorea API does NOT return lat/lng in the measurement endpoint
- Need separate call to 측정소정보 API or maintain a static lookup table
- Endpoint: `/getMsrstnList` returns station coordinates
- **Strategy**: Fetch station list on startup, cache in DB, join with readings

### Fetching Strategy
- 17 시도 × 1 call each = 17 calls per fetch cycle
- Every 30 minutes = 17 × 48 = 816 calls/day = ~24,480/month
- May need to optimize: fetch only major cities, or batch into fewer calls

---

## 4. 기상청 단기예보 (Weather)

**Portal**: https://www.data.go.kr/data/15084084/openapi.do
**Base URL**: `http://apis.data.go.kr/1360000/VilageFcstInfoService2.0`

### Endpoints
- `/getUltraSrtNcst` — 초단기실황 (ultra-short-term observations)
- `/getVilageFcst` — 단기예보 (short-term forecast)

### Parameters (초단기실황)
| Param | Required | Example | Description |
|-------|----------|---------|-------------|
| serviceKey | Y | (API key) | data.go.kr 인증키 |
| numOfRows | N | 100 | Results per page |
| pageNo | N | 1 | Page number |
| dataType | N | JSON | Response format |
| base_date | Y | 20260410 | 발표일자 (YYYYMMDD) |
| base_time | Y | 1500 | 발표시각 (HHMM) |
| nx | Y | 60 | Grid X coordinate |
| ny | Y | 127 | Grid Y coordinate |

### Grid System
- KMA uses its own grid coordinate system (not lat/lng)
- Need conversion: lat/lng → nx/ny
- Seoul City Hall: nx=60, ny=127
- Conversion formula exists (Lambert Conformal Conic Projection)
- **Strategy**: Pre-define ~20 major city grid coordinates as constants

### Response Fields
```json
{
  "response": {
    "body": {
      "items": {
        "item": [
          { "category": "T1H", "obsrValue": "18.5" },
          { "category": "RN1", "obsrValue": "0" },
          { "category": "REH", "obsrValue": "55" },
          { "category": "WSD", "obsrValue": "3.2" },
          { "category": "VEC", "obsrValue": "230" }
        ]
      }
    }
  }
}
```

### Category Codes
| Code | Description | Unit |
|------|-------------|------|
| T1H | 기온 (Temperature) | °C |
| RN1 | 1시간 강수량 | mm |
| REH | 습도 (Humidity) | % |
| UUU | 동서바람성분 | m/s |
| VVV | 남북바람성분 | m/s |
| WSD | 풍속 (Wind Speed) | m/s |
| VEC | 풍향 (Wind Direction) | deg |
| PTY | 강수형태 | code (0=없음, 1=비, 2=비/눈, 3=눈, 5=빗방울, 6=진눈깨비, 7=눈날림) |

### Major City Grid Coordinates
```java
Map.of(
    "서울", new int[]{60, 127},
    "부산", new int[]{98, 76},
    "대구", new int[]{89, 90},
    "인천", new int[]{55, 124},
    "광주", new int[]{58, 74},
    "대전", new int[]{67, 100},
    "울산", new int[]{102, 84},
    "세종", new int[]{66, 103},
    "제주", new int[]{52, 38},
    "수원", new int[]{60, 121},
    "춘천", new int[]{73, 134},
    "청주", new int[]{69, 106},
    "전주", new int[]{63, 89},
    "포항", new int[]{102, 94},
    "창원", new int[]{90, 77},
    "강릉", new int[]{92, 131}
)
```

---

## 5. NASA FIRMS (Wildfires)

**URL**: `https://firms.modaps.eosdis.nasa.gov/api/country/csv/{MAP_KEY}/{SOURCE}/KOR/{DAY_RANGE}`
**Auth**: Free MAP_KEY required (get from https://firms.modaps.eosdis.nasa.gov/api/)
**Alternative (area query)**: `https://firms.modaps.eosdis.nasa.gov/api/area/csv/{MAP_KEY}/{SOURCE}/124,33,132,43/{DAY_RANGE}`

### Endpoint Format
```
https://firms.modaps.eosdis.nasa.gov/api/country/csv/{source}/{country_code}/{day_range}
```
- `source`: MODIS_NRT, VIIRS_NOAA20_NRT, VIIRS_SNPP_NRT
- `country_code`: KOR
- `day_range`: 1 (last 24h), 2 (last 48h), up to 10

### CSV Response Columns
```
latitude,longitude,brightness,scan,track,acq_date,acq_time,satellite,confidence,version,bright_t31,frp,daynight
37.456,128.732,312.5,1.0,1.0,2026-04-10,1430,Terra,85,6.1NRT,290.3,15.3,D
```

### Field Mapping
| CSV Column | Entity Field | Type |
|-----------|-------------|------|
| latitude | latitude | Double |
| longitude | longitude | Double |
| brightness | brightness | Double |
| confidence | confidence | Integer |
| frp | frp | Double |
| satellite | satellite | String |
| acq_date + acq_time | detectedAt | LocalDateTime |

### Notes
- Returns CSV, parse line by line (skip header)
- Korea may have 0 fires on quiet days — handle empty response
- VIIRS has higher resolution than MODIS, consider fetching both
- No rate limit documented for basic endpoint

---

## 6. Seoul TOPIS 교통정보 (Traffic) — Optional

**Portal**: http://topis.seoul.go.kr
**Note**: Seoul-only coverage, API may require separate registration

### Alternative: ITS 국가교통정보센터
**Portal**: https://www.data.go.kr/data/15058462/openapi.do
**Base URL**: `http://apis.data.go.kr/B552061/frequentzoneDeath`

### Notes
- Traffic APIs are the least documented of all sources
- Fallback plan: skip traffic layer if API registration is slow
- Can add as v2 feature
- Seoul TOPIS may have CORS issues — route through Spring Boot backend

---

## Fetching Schedule Summary

| Source | Interval | Calls/Day | Calls/Month | Status |
|--------|----------|-----------|-------------|--------|
| Earthquake | 5 min | 288 | 8,640 | Within 10K limit |
| Disaster Alerts | 2 min | 720 | 21,600 | May need separate key |
| Air Quality | 30 min | 816 | 24,480 | Close to limit, optimize |
| Weather | 15 min | 1,536 | 46,080 | May need separate key |
| Wildfires | 10 min | 144 | 4,320 | No limit |
| Traffic | 3 min | 480 | 14,400 | TBD |

### Rate Limit Strategy
- data.go.kr gives 10,000 calls/month per API per key
- Some APIs may share the same key quota
- **Solution**: Apply for each API separately to get separate quotas
- For development: use longer intervals and cache aggressively
- For production: consider data.go.kr 활용신청 for higher quota
