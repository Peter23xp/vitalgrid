export const REGIONS: Record<string, string[]> = {
  CD: ['Kinshasa','Kongo Central','Kwango','Kwilu','Mai-Ndombe','Kasaï','Kasaï-Central','Kasaï-Oriental','Lomami','Sankuru','Maniema','Sud-Kivu','Nord-Kivu','Ituri','Haut-Uele','Tshopo','Bas-Uele','Nord-Ubangi','Mongala','Sud-Ubangi','Équateur','Tshuapa','Tanganyika','Haut-Lomami','Lualaba','Haut-Katanga'],
  RW: ['Kigali','Province du Nord','Province du Sud','Province de l\'Est','Province de l\'Ouest'],
  BI: ['Bubanza','Bujumbura Mairie','Bujumbura Rural','Bururi','Cankuzo','Cibitoke','Gitega','Karuzi','Kayanza','Kirundo','Makamba','Muramvya','Muyinga','Mwaro','Ngozi','Rumonge','Rutana','Ruyigi'],
  UG: ['Kampala','Gulu','Lira','Mbarara','Jinja','Fort Portal','Entebbe','Arua','Kabale','Soroti'],
  TZ: ['Dar es Salaam','Dodoma','Mwanza','Arusha','Mbeya','Morogoro','Tanga','Kagera','Kigoma','Kilimanjaro','Ruvuma','Mtwara','Lindi','Singida','Tabora','Rukwa','Shinyanga','Mara','Iringa','Pwani'],
  KE: ['Nairobi','Mombasa','Kisumu','Nakuru','Eldoret','Thika','Malindi','Kitale','Garissa','Kakamega'],
  SS: ['Juba','Wau','Malakal','Yei','Bor','Torit','Aweil','Rumbek','Bentiu'],
  CG: ['Brazzaville','Pointe-Noire','Dolisie','Nkayi','Impfondo','Ouesso','Sibiti','Madingou'],
  CF: ['Bangui','Berbérati','Carnot','Bambari','Bangassou','Bossangoa','Bouar','Nola'],
  ET: ['Addis-Abeba','Amhara','Oromia','Somali','Tigray','SNNPR','Afar','Harari','Dire Dawa'],
  NG: ['Lagos','Kano','Ibadan','Abuja','Port Harcourt','Benin City','Maiduguri','Kaduna','Zaria','Aba'],
  ZA: ['Gauteng','Cap-Occidental','KwaZulu-Natal','Cap-Oriental','Limpopo','Mpumalanga','Nord-Ouest','État libre d\'Orange','Cap-du-Nord'],
  GH: ['Accra','Kumasi','Tamale','Sekondi-Takoradi','Ashaiman','Sunyani','Cape Coast','Obuasi'],
  CM: ['Adamaoua','Centre','Est','Extrême-Nord','Littoral','Nord','Nord-Ouest','Ouest','Sud','Sud-Ouest'],
  SN: ['Dakar','Diourbel','Fatick','Kaffrine','Kaolack','Kédougou','Kolda','Louga','Matam','Saint-Louis','Sédhiou','Tambacounda','Thiès','Ziguinchor'],
};

export function getRegions(countryCode: string): string[] | null {
  return REGIONS[countryCode] ?? null;
}
