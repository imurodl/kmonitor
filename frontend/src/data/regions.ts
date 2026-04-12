export interface Region {
  id: string;
  name: string;
  nameEn: string;
  center: [number, number]; // [lng, lat]
  zoomHeight: number;
}

export const REGIONS: Region[] = [
  { id: "seoul", name: "서울특별시", nameEn: "Seoul", center: [126.978, 37.5665], zoomHeight: 80000 },
  { id: "busan", name: "부산광역시", nameEn: "Busan", center: [129.0756, 35.1796], zoomHeight: 80000 },
  { id: "daegu", name: "대구광역시", nameEn: "Daegu", center: [128.6014, 35.8714], zoomHeight: 80000 },
  { id: "incheon", name: "인천광역시", nameEn: "Incheon", center: [126.7052, 37.4563], zoomHeight: 100000 },
  { id: "gwangju", name: "광주광역시", nameEn: "Gwangju", center: [126.8526, 35.1595], zoomHeight: 60000 },
  { id: "daejeon", name: "대전광역시", nameEn: "Daejeon", center: [127.3845, 36.3504], zoomHeight: 60000 },
  { id: "ulsan", name: "울산광역시", nameEn: "Ulsan", center: [129.3114, 35.5384], zoomHeight: 80000 },
  { id: "sejong", name: "세종특별자치시", nameEn: "Sejong", center: [127.2561, 36.4801], zoomHeight: 60000 },
  { id: "gyeonggi", name: "경기도", nameEn: "Gyeonggi", center: [127.0, 37.28], zoomHeight: 200000 },
  { id: "gangwon", name: "강원특별자치도", nameEn: "Gangwon", center: [128.1555, 37.8228], zoomHeight: 250000 },
  { id: "chungbuk", name: "충청북도", nameEn: "Chungbuk", center: [127.4913, 36.6357], zoomHeight: 200000 },
  { id: "chungnam", name: "충청남도", nameEn: "Chungnam", center: [126.8, 36.5184], zoomHeight: 200000 },
  { id: "jeonbuk", name: "전북특별자치도", nameEn: "Jeonbuk", center: [127.153, 35.7175], zoomHeight: 200000 },
  { id: "jeonnam", name: "전라남도", nameEn: "Jeonnam", center: [126.991, 34.8679], zoomHeight: 250000 },
  { id: "gyeongbuk", name: "경상북도", nameEn: "Gyeongbuk", center: [128.8714, 36.249], zoomHeight: 300000 },
  { id: "gyeongnam", name: "경상남도", nameEn: "Gyeongnam", center: [128.2132, 35.4606], zoomHeight: 250000 },
  { id: "jeju", name: "제주특별자치도", nameEn: "Jeju", center: [126.5312, 33.4996], zoomHeight: 120000 },
];

export function getRegionById(id: string): Region | undefined {
  return REGIONS.find((r) => r.id === id);
}
