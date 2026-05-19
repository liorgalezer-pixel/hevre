export type USState = {
  abbr: string;
  en: string;
  he: string;
};

export type USCity = {
  en: string;
  he: string;
  stateAbbr: string;
};

export const US_STATES: USState[] = [
  { abbr: "AL", en: "Alabama", he: "אלבמה" },
  { abbr: "AK", en: "Alaska", he: "אלסקה" },
  { abbr: "AZ", en: "Arizona", he: "אריזונה" },
  { abbr: "AR", en: "Arkansas", he: "ארקנסו" },
  { abbr: "CA", en: "California", he: "קליפורניה" },
  { abbr: "CO", en: "Colorado", he: "קולורדו" },
  { abbr: "CT", en: "Connecticut", he: "קונטיקט" },
  { abbr: "DE", en: "Delaware", he: "דלאוור" },
  { abbr: "FL", en: "Florida", he: "פלורידה" },
  { abbr: "GA", en: "Georgia", he: "ג'ורג'יה" },
  { abbr: "HI", en: "Hawaii", he: "הוואי" },
  { abbr: "ID", en: "Idaho", he: "איידהו" },
  { abbr: "IL", en: "Illinois", he: "אילינוי" },
  { abbr: "IN", en: "Indiana", he: "אינדיאנה" },
  { abbr: "IA", en: "Iowa", he: "איווה" },
  { abbr: "KS", en: "Kansas", he: "קנזס" },
  { abbr: "KY", en: "Kentucky", he: "קנטקי" },
  { abbr: "LA", en: "Louisiana", he: "לואיזיאנה" },
  { abbr: "ME", en: "Maine", he: "מיין" },
  { abbr: "MD", en: "Maryland", he: "מרילנד" },
  { abbr: "MA", en: "Massachusetts", he: "מסצ'וסטס" },
  { abbr: "MI", en: "Michigan", he: "מישיגן" },
  { abbr: "MN", en: "Minnesota", he: "מינסוטה" },
  { abbr: "MS", en: "Mississippi", he: "מיסיסיפי" },
  { abbr: "MO", en: "Missouri", he: "מיזורי" },
  { abbr: "MT", en: "Montana", he: "מונטנה" },
  { abbr: "NE", en: "Nebraska", he: "נברסקה" },
  { abbr: "NV", en: "Nevada", he: "נבאדה" },
  { abbr: "NH", en: "New Hampshire", he: "ניו המפשייר" },
  { abbr: "NJ", en: "New Jersey", he: "ניו ג'רזי" },
  { abbr: "NM", en: "New Mexico", he: "ניו מקסיקו" },
  { abbr: "NY", en: "New York", he: "ניו יורק" },
  { abbr: "NC", en: "North Carolina", he: "צפון קרוליינה" },
  { abbr: "ND", en: "North Dakota", he: "צפון דקוטה" },
  { abbr: "OH", en: "Ohio", he: "אוהיו" },
  { abbr: "OK", en: "Oklahoma", he: "אוקלהומה" },
  { abbr: "OR", en: "Oregon", he: "אורגון" },
  { abbr: "PA", en: "Pennsylvania", he: "פנסילבניה" },
  { abbr: "RI", en: "Rhode Island", he: "רוד איילנד" },
  { abbr: "SC", en: "South Carolina", he: "דרום קרוליינה" },
  { abbr: "SD", en: "South Dakota", he: "דרום דקוטה" },
  { abbr: "TN", en: "Tennessee", he: "טנסי" },
  { abbr: "TX", en: "Texas", he: "טקסס" },
  { abbr: "UT", en: "Utah", he: "יוטה" },
  { abbr: "VT", en: "Vermont", he: "ורמונט" },
  { abbr: "VA", en: "Virginia", he: "וירג'יניה" },
  { abbr: "WA", en: "Washington", he: "וושינגטון" },
  { abbr: "WV", en: "West Virginia", he: "מערב וירג'יניה" },
  { abbr: "WI", en: "Wisconsin", he: "ויסקונסין" },
  { abbr: "WY", en: "Wyoming", he: "ויומינג" },
];

export const US_CITIES: USCity[] = [
  // New York
  { en: "New York City", he: "ניו יורק סיטי", stateAbbr: "NY" },
  { en: "Brooklyn", he: "ברוקלין", stateAbbr: "NY" },
  { en: "Queens", he: "קווינס", stateAbbr: "NY" },
  { en: "Manhattan", he: "מנהטן", stateAbbr: "NY" },
  { en: "Bronx", he: "ברונקס", stateAbbr: "NY" },
  { en: "Staten Island", he: "סטטן איילנד", stateAbbr: "NY" },
  { en: "Buffalo", he: "באפלו", stateAbbr: "NY" },
  { en: "Albany", he: "אולבני", stateAbbr: "NY" },
  { en: "Yonkers", he: "יונקרס", stateAbbr: "NY" },
  // New Jersey
  { en: "Newark", he: "נוארק", stateAbbr: "NJ" },
  { en: "Jersey City", he: "ג'רזי סיטי", stateAbbr: "NJ" },
  { en: "Teaneck", he: "טינק", stateAbbr: "NJ" },
  { en: "Lakewood", he: "לייקווד", stateAbbr: "NJ" },
  { en: "Edison", he: "אדיסון", stateAbbr: "NJ" },
  { en: "Trenton", he: "טרנטון", stateAbbr: "NJ" },
  // Florida
  { en: "Miami", he: "מיאמי", stateAbbr: "FL" },
  { en: "Miami Beach", he: "מיאמי ביץ'", stateAbbr: "FL" },
  { en: "Orlando", he: "אורלנדו", stateAbbr: "FL" },
  { en: "Tampa", he: "טמפה", stateAbbr: "FL" },
  { en: "Fort Lauderdale", he: "פורט לודרדייל", stateAbbr: "FL" },
  { en: "Boca Raton", he: "בוקה רטון", stateAbbr: "FL" },
  { en: "Jacksonville", he: "ג'קסונוויל", stateAbbr: "FL" },
  { en: "Aventura", he: "אבנטורה", stateAbbr: "FL" },
  { en: "Hallandale Beach", he: "הלנדייל ביץ'", stateAbbr: "FL" },
  // California
  { en: "Los Angeles", he: "לוס אנג'לס", stateAbbr: "CA" },
  { en: "San Francisco", he: "סן פרנסיסקו", stateAbbr: "CA" },
  { en: "San Diego", he: "סן דייגו", stateAbbr: "CA" },
  { en: "Beverly Hills", he: "בוורלי הילס", stateAbbr: "CA" },
  { en: "Santa Monica", he: "סנטה מוניקה", stateAbbr: "CA" },
  { en: "Sacramento", he: "סקרמנטו", stateAbbr: "CA" },
  { en: "San Jose", he: "סן חוזה", stateAbbr: "CA" },
  // Texas
  { en: "Houston", he: "יוסטון", stateAbbr: "TX" },
  { en: "Dallas", he: "דאלאס", stateAbbr: "TX" },
  { en: "Austin", he: "אוסטין", stateAbbr: "TX" },
  { en: "San Antonio", he: "סן אנטוניו", stateAbbr: "TX" },
  { en: "Fort Worth", he: "פורט וורת'", stateAbbr: "TX" },
  // Illinois
  { en: "Chicago", he: "שיקגו", stateAbbr: "IL" },
  { en: "Evanston", he: "אוונסטון", stateAbbr: "IL" },
  { en: "Skokie", he: "סקוקי", stateAbbr: "IL" },
  // Pennsylvania
  { en: "Philadelphia", he: "פילדלפיה", stateAbbr: "PA" },
  { en: "Pittsburgh", he: "פיטסבורג", stateAbbr: "PA" },
  // Georgia
  { en: "Atlanta", he: "אטלנטה", stateAbbr: "GA" },
  { en: "Savannah", he: "סוונה", stateAbbr: "GA" },
  // Arizona
  { en: "Phoenix", he: "פיניקס", stateAbbr: "AZ" },
  { en: "Scottsdale", he: "סקוטסדייל", stateAbbr: "AZ" },
  { en: "Tucson", he: "טוסון", stateAbbr: "AZ" },
  // Nevada
  { en: "Las Vegas", he: "לאס וגאס", stateAbbr: "NV" },
  { en: "Henderson", he: "הנדרסון", stateAbbr: "NV" },
  { en: "Reno", he: "ריינו", stateAbbr: "NV" },
  // Washington
  { en: "Seattle", he: "סיאטל", stateAbbr: "WA" },
  { en: "Bellevue", he: "בלוויו", stateAbbr: "WA" },
  // Massachusetts
  { en: "Boston", he: "בוסטון", stateAbbr: "MA" },
  { en: "Cambridge", he: "קיימברידג'", stateAbbr: "MA" },
  { en: "Brookline", he: "ברוקליין", stateAbbr: "MA" },
  // Maryland
  { en: "Baltimore", he: "בולטימור", stateAbbr: "MD" },
  { en: "Rockville", he: "רוקוויל", stateAbbr: "MD" },
  { en: "Silver Spring", he: "סילבר ספרינג", stateAbbr: "MD" },
  // Colorado
  { en: "Denver", he: "דנוור", stateAbbr: "CO" },
  { en: "Boulder", he: "בולדר", stateAbbr: "CO" },
  // Michigan
  { en: "Detroit", he: "דטרויט", stateAbbr: "MI" },
  { en: "Ann Arbor", he: "אן ארבור", stateAbbr: "MI" },
  // North Carolina
  { en: "Charlotte", he: "שרלוט", stateAbbr: "NC" },
  { en: "Raleigh", he: "ראלי", stateAbbr: "NC" },
  // Virginia
  { en: "Virginia Beach", he: "וירג'יניה ביץ'", stateAbbr: "VA" },
  { en: "Arlington", he: "ארלינגטון", stateAbbr: "VA" },
  { en: "Alexandria", he: "אלכסנדריה", stateAbbr: "VA" },
  // Ohio
  { en: "Columbus", he: "קולומבוס", stateAbbr: "OH" },
  { en: "Cleveland", he: "קליוולנד", stateAbbr: "OH" },
  { en: "Cincinnati", he: "סינסינטי", stateAbbr: "OH" },
  // Minnesota
  { en: "Minneapolis", he: "מיניאפוליס", stateAbbr: "MN" },
  { en: "Saint Paul", he: "סנט פול", stateAbbr: "MN" },
  // Connecticut
  { en: "Hartford", he: "הארטפורד", stateAbbr: "CT" },
  { en: "New Haven", he: "ניו הייבן", stateAbbr: "CT" },
  { en: "Stamford", he: "סטמפורד", stateAbbr: "CT" },
  // Tennessee
  { en: "Nashville", he: "נאשוויל", stateAbbr: "TN" },
  { en: "Memphis", he: "ממפיס", stateAbbr: "TN" },
  // Missouri
  { en: "Kansas City", he: "קנזס סיטי", stateAbbr: "MO" },
  { en: "St. Louis", he: "סנט לואיס", stateAbbr: "MO" },
  // Oregon
  { en: "Portland", he: "פורטלנד", stateAbbr: "OR" },
  { en: "Eugene", he: "יוג'ין", stateAbbr: "OR" },
  // Indiana
  { en: "Indianapolis", he: "אינדיאנפוליס", stateAbbr: "IN" },
  // Wisconsin
  { en: "Milwaukee", he: "מילווקי", stateAbbr: "WI" },
  { en: "Madison", he: "מדיסון", stateAbbr: "WI" },
  // Louisiana
  { en: "New Orleans", he: "ניו אורלינס", stateAbbr: "LA" },
  { en: "Baton Rouge", he: "בטון רוז'", stateAbbr: "LA" },
  // Hawaii
  { en: "Honolulu", he: "הונולולו", stateAbbr: "HI" },
  // Utah
  { en: "Salt Lake City", he: "סולט לייק סיטי", stateAbbr: "UT" },
  { en: "Provo", he: "פרובו", stateAbbr: "UT" },
  // Kentucky
  { en: "Louisville", he: "לואיוויל", stateAbbr: "KY" },
  { en: "Lexington", he: "לקסינגטון", stateAbbr: "KY" },
  // South Carolina
  { en: "Charleston", he: "צ'ארלסטון", stateAbbr: "SC" },
  { en: "Columbia", he: "קולומביה", stateAbbr: "SC" },
  // Alabama
  { en: "Birmingham", he: "ברמינגהם", stateAbbr: "AL" },
  { en: "Montgomery", he: "מונטגומרי", stateAbbr: "AL" },
  // Oklahoma
  { en: "Oklahoma City", he: "אוקלהומה סיטי", stateAbbr: "OK" },
  { en: "Tulsa", he: "טולסה", stateAbbr: "OK" },
  // Iowa
  { en: "Des Moines", he: "דה מוין", stateAbbr: "IA" },
  // Kansas
  { en: "Wichita", he: "וויצ'יטה", stateAbbr: "KS" },
  // New Mexico
  { en: "Albuquerque", he: "אלבקרקי", stateAbbr: "NM" },
  { en: "Santa Fe", he: "סנטה פה", stateAbbr: "NM" },
  // Nebraska
  { en: "Omaha", he: "אומהה", stateAbbr: "NE" },
  // Rhode Island
  { en: "Providence", he: "פרובידנס", stateAbbr: "RI" },
  // New Hampshire
  { en: "Manchester", he: "מנצ'סטר", stateAbbr: "NH" },
  // Maine
  { en: "Portland", he: "פורטלנד", stateAbbr: "ME" },
  // Delaware
  { en: "Wilmington", he: "וילמינגטון", stateAbbr: "DE" },
  // Vermont
  { en: "Burlington", he: "ברלינגטון", stateAbbr: "VT" },
  // Mississippi
  { en: "Jackson", he: "ג'קסון", stateAbbr: "MS" },
  // Arkansas
  { en: "Little Rock", he: "ליטל רוק", stateAbbr: "AR" },
  // Montana
  { en: "Billings", he: "בילינגס", stateAbbr: "MT" },
  // Idaho
  { en: "Boise", he: "בויסי", stateAbbr: "ID" },
  // North Dakota
  { en: "Fargo", he: "פארגו", stateAbbr: "ND" },
  // South Dakota
  { en: "Sioux Falls", he: "סו פולס", stateAbbr: "SD" },
  // Wyoming
  { en: "Cheyenne", he: "שאיין", stateAbbr: "WY" },
  // West Virginia
  { en: "Charleston", he: "צ'ארלסטון", stateAbbr: "WV" },
  // Alaska
  { en: "Anchorage", he: "אנקורג'", stateAbbr: "AK" },
];

export function getCitiesForStates(stateAbbrs: string[]): USCity[] {
  if (stateAbbrs.length === 0) return US_CITIES;
  return US_CITIES.filter((c) => stateAbbrs.includes(c.stateAbbr));
}
