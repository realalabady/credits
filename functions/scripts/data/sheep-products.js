/**
 * كتالوج الذبائح — بيانات المنتجات التي يزرعها seed-products.js.
 *
 * التسعير مبني على ثلاث فئات جودة، وكل فئة لها ثلاث حصص. الأسعار الستة
 * المسموح بها (405 / 540 / 675 / 810 / 1350 / 2500 ريال) موزّعة كالتالي:
 *
 *   فاخرة  (نجدي، حري)              كاملة 2500 | نصف 1350 | ثلث 810
 *   ممتازة (نعيمي، سواكني، تركي)     كاملة 1350 | نصف  810 | ثلث 675
 *   اقتصادية (رومي، أسترالي، صومالي) كاملة  810 | نصف  540 | ثلث 405
 *
 * داخل كل سلالة: ثلث < نصف < كاملة. وسعر الحصة الصغيرة أعلى نسبياً من نصيبها
 * من الذبيحة الكاملة، وهو ما تفعله السوق فعلاً لأن التقطيع الجزئي أعلى كلفة.
 *
 * الصور: ملفات حقيقية من ويكيميديا كومنز (رخص حرة)، تُهوتلنك مباشرة من
 * upload.wikimedia.org. الموزّع أدناه يضمن ألا تتكرر صورة واحدة بين منتجين.
 */

// ==================== بنك الصور ====================
// كل مجموعة تخص سلالة أو نوع لقطة. الترتيب مقصود: الأنسب كصورة رئيسية أولاً.
const IMG = {
  najdi: [
    // Najdi sheep 5.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Najdi_sheep_5.jpg/1280px-Najdi_sheep_5.jpg",
    // Najdi sheep 3.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Najdi_sheep_3.jpg/1280px-Najdi_sheep_3.jpg",
    // Najdi sheep 8.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Najdi_sheep_8.jpg/1280px-Najdi_sheep_8.jpg",
    // Najdi sheep 2.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Najdi_sheep_2.jpg/1280px-Najdi_sheep_2.jpg",
    // Najdi sheep 9.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Najdi_sheep_9.jpg/1280px-Najdi_sheep_9.jpg",
    // Najdi sheep 6.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Najdi_sheep_6.jpg/1280px-Najdi_sheep_6.jpg",
  ],
  naimi: [
    // Kuwaiti sheep.jpg
    "https://upload.wikimedia.org/wikipedia/commons/6/61/Kuwaiti_sheep.jpg",
    // Awassi sheep Bulgaria 03.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Awassi_sheep_Bulgaria_03.jpg/1280px-Awassi_sheep_Bulgaria_03.jpg",
    // Awassi sheep Bulgaria 04.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Awassi_sheep_Bulgaria_04.jpg/1280px-Awassi_sheep_Bulgaria_04.jpg",
    // Awassi sheep Bulgaria 01.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Awassi_sheep_Bulgaria_01.jpg/1280px-Awassi_sheep_Bulgaria_01.jpg",
    // Awassi sheep Bulgaria 05.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Awassi_sheep_Bulgaria_05.jpg/1280px-Awassi_sheep_Bulgaria_05.jpg",
    // Awassi sheep Bulgaria 06.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Awassi_sheep_Bulgaria_06.jpg/1280px-Awassi_sheep_Bulgaria_06.jpg",
  ],
  sudani: [
    // Pets of the Sudanese Desert. The Sudanese sheep.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Pets_of_the_Sudanese_Desert._The_Sudanese_sheep.jpg/1280px-Pets_of_the_Sudanese_Desert._The_Sudanese_sheep.jpg",
    // Sheep Jordan 1.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Sheep_Jordan_1.jpg/1280px-Sheep_Jordan_1.jpg",
    // PikiWiki Israel 18899 Male Sheep in the Negev.JPG
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/PikiWiki_Israel_18899_Male_Sheep_in_the_Negev.JPG/1280px-PikiWiki_Israel_18899_Male_Sheep_in_the_Negev.JPG",
    // Des moutons.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Des_moutons.jpg/1280px-Des_moutons.jpg",
    // Image of a ram.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Image_of_a_ram.jpg/1280px-Image_of_a_ram.jpg",
    // Animaux domestiques.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Animaux_domestiques.jpg/1280px-Animaux_domestiques.jpg",
    // Pets of the Sudanese Desert. Sheep. Northern Sudan. Wadi Allaqi.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Pets_of_the_Sudanese_Desert._Sheep._Northern_Sudan._Wadi_Allaqi.jpg/1280px-Pets_of_the_Sudanese_Desert._Sheep._Northern_Sudan._Wadi_Allaqi.jpg",
    // Niger, N'Gonga (12), scene at livestock market.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Niger%2C_N%27Gonga_%2812%29%2C_scene_at_livestock_market.jpg/1280px-Niger%2C_N%27Gonga_%2812%29%2C_scene_at_livestock_market.jpg",
    // Pets of the Sudanese Desert. Gradient. Sheep. Sudan. Wadi Allaqi.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Pets_of_the_Sudanese_Desert._Gradient._Sheep._Sudan._Wadi_Allaqi.jpg/1280px-Pets_of_the_Sudanese_Desert._Gradient._Sheep._Sudan._Wadi_Allaqi.jpg",
    // Sheep market, Kuwait City 1980.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Sheep_market%2C_Kuwait_City_1980.jpg/1280px-Sheep_market%2C_Kuwait_City_1980.jpg",
    // Beja Child with sheep.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Beja_Child_with_sheep.jpg/1280px-Beja_Child_with_sheep.jpg",
    // Toubou shepherd and flock in the Ennedi Mountains - northeastern Chad 2015.jpg
    "https://upload.wikimedia.org/wikipedia/commons/4/4b/Toubou_shepherd_and_flock_in_the_Ennedi_Mountains_-_northeastern_Chad_2015.jpg",
  ],
  turki: [
    // Ram in Profile - Germiyan Province - Kurdistan - Iraq.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Ram_in_Profile_-_Germiyan_Province_-_Kurdistan_-_Iraq.jpg/1280px-Ram_in_Profile_-_Germiyan_Province_-_Kurdistan_-_Iraq.jpg",
    // Sheep of Syria.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Sheep_of_Syria.jpg/1280px-Sheep_of_Syria.jpg",
    // Baaa - panoramio.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Baaa_-_panoramio.jpg/1280px-Baaa_-_panoramio.jpg",
    // مجموعة من الخرفان.JPG
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/%D9%85%D8%AC%D9%85%D9%88%D8%B9%D8%A9_%D9%85%D9%86_%D8%A7%D9%84%D8%AE%D8%B1%D9%81%D8%A7%D9%86.JPG/1280px-%D9%85%D8%AC%D9%85%D9%88%D8%B9%D8%A9_%D9%85%D9%86_%D8%A7%D9%84%D8%AE%D8%B1%D9%81%D8%A7%D9%86.JPG",
    // Sheep in Kurdistan.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Sheep_in_Kurdistan.jpg/1280px-Sheep_in_Kurdistan.jpg",
    // أغنام في مرعى للماشية 02.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/%D8%A3%D8%BA%D9%86%D8%A7%D9%85_%D9%81%D9%8A_%D9%85%D8%B1%D8%B9%D9%89_%D9%84%D9%84%D9%85%D8%A7%D8%B4%D9%8A%D8%A9_02.jpg/1280px-%D8%A3%D8%BA%D9%86%D8%A7%D9%85_%D9%81%D9%8A_%D9%85%D8%B1%D8%B9%D9%89_%D9%84%D9%84%D9%85%D8%A7%D8%B4%D9%8A%D8%A9_02.jpg",
  ],
  romani: [
    // Walachenschaf Tiergarten Worms 2011.JPG
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Walachenschaf_Tiergarten_Worms_2011.JPG/1280px-Walachenschaf_Tiergarten_Worms_2011.JPG",
    // 2022-11-13 Female Valachian sheep in Hesse (101).jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/2022-11-13_Female_Valachian_sheep_in_Hesse_%28101%29.jpg/1280px-2022-11-13_Female_Valachian_sheep_in_Hesse_%28101%29.jpg",
    // 2022-11-13 Female Valachian sheep in Hesse (113).jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/2022-11-13_Female_Valachian_sheep_in_Hesse_%28113%29.jpg/1280px-2022-11-13_Female_Valachian_sheep_in_Hesse_%28113%29.jpg",
    // 2022-11-13 Female Valachian sheep in Hesse (110).jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/2022-11-13_Female_Valachian_sheep_in_Hesse_%28110%29.jpg/1280px-2022-11-13_Female_Valachian_sheep_in_Hesse_%28110%29.jpg",
    // Mouton de Valachie, parc animalier de Janvry (Essonne).jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Mouton_de_Valachie%2C_parc_animalier_de_Janvry_%28Essonne%29.jpg/1280px-Mouton_de_Valachie%2C_parc_animalier_de_Janvry_%28Essonne%29.jpg",
    // Schloss Hof - Walachenschaf.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Schloss_Hof_-_Walachenschaf.jpg/1280px-Schloss_Hof_-_Walachenschaf.jpg",
  ],
  australi: [
    // Merino ram.JPG
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Merino_ram.JPG/1280px-Merino_ram.JPG",
    // Sheep eating.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Sheep_eating.jpg/1280px-Sheep_eating.jpg",
    // Merino sheep. (8096354999).jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Merino_sheep._%288096354999%29.jpg/1280px-Merino_sheep._%288096354999%29.jpg",
    // Merino sheep grazing Desmanthus in Western Queensland 3616.jpg
    "https://upload.wikimedia.org/wikipedia/commons/4/41/Merino_sheep_grazing_Desmanthus_in_Western_Queensland_3616.jpg",
    // Merino sheep. (53559153093).jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Merino_sheep._%2853559153093%29.jpg/1280px-Merino_sheep._%2853559153093%29.jpg",
    // Merino sheep. (52908265984).jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Merino_sheep._%2852908265984%29.jpg/1280px-Merino_sheep._%2852908265984%29.jpg",
  ],
  somali: [
    // Sheep in Pretoria SA.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Sheep_in_Pretoria_SA.jpg/1280px-Sheep_in_Pretoria_SA.jpg",
    // Somali-Schaf im Zoo Gelsenkirchen.JPG
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Somali-Schaf_im_Zoo_Gelsenkirchen.JPG/1280px-Somali-Schaf_im_Zoo_Gelsenkirchen.JPG",
    // Reserve Sigean - Mouton de Somalie 05.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Reserve_Sigean_-_Mouton_de_Somalie_05.jpg/1280px-Reserve_Sigean_-_Mouton_de_Somalie_05.jpg",
    // Moutons de Somalie.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Moutons_de_Somalie.jpg/1280px-Moutons_de_Somalie.jpg",
    // Bovidae Ovis aries (Somali sheep).jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Bovidae_Ovis_aries_%28Somali_sheep%29.jpg/1280px-Bovidae_Ovis_aries_%28Somali_sheep%29.jpg",
    // Blackhead Persian sheep.jpg
    "https://upload.wikimedia.org/wikipedia/commons/c/c3/Blackhead_Persian_sheep.jpg",
  ],
  cuts: [
    // Mutton chop.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Mutton_chop.jpg/1280px-Mutton_chop.jpg",
    // Lamb meat (1).jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Lamb_meat_%281%29.jpg/1280px-Lamb_meat_%281%29.jpg",
    // Lamb meat (2).jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Lamb_meat_%282%29.jpg/1280px-Lamb_meat_%282%29.jpg",
    // Raw lamb cutlets with shredded ginger and rosemary.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Raw_lamb_cutlets_with_shredded_ginger_and_rosemary.jpg/1280px-Raw_lamb_cutlets_with_shredded_ginger_and_rosemary.jpg",
    // Gfp-more-lamb-meat.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Gfp-more-lamb-meat.jpg/1280px-Gfp-more-lamb-meat.jpg",
    // 2017-04-15 Lamb meat for sale at Australian supermarket.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/2017-04-15_Lamb_meat_for_sale_at_Australian_supermarket.jpg/1280px-2017-04-15_Lamb_meat_for_sale_at_Australian_supermarket.jpg",
    // Paletillas de cordero.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Paletillas_de_cordero.jpg/1280px-Paletillas_de_cordero.jpg",
    // Lamb Chops.JPG
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Lamb_Chops.JPG/1280px-Lamb_Chops.JPG",
    // -2022-02-08 Sliced neck of lamb, Trimingham, Norfolk.JPG
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/-2022-02-08_Sliced_neck_of_lamb%2C_Trimingham%2C_Norfolk.JPG/1280px--2022-02-08_Sliced_neck_of_lamb%2C_Trimingham%2C_Norfolk.JPG",
    // Lamb carcasses Kasap Suat Kadinlar Carsisi Istanbul 2026.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Lamb_carcasses_Kasap_Suat_Kadinlar_Carsisi_Istanbul_2026.jpg/1280px-Lamb_carcasses_Kasap_Suat_Kadinlar_Carsisi_Istanbul_2026.jpg",
    // Mutton sold at Guoshuhao Supermarket, Yuandalu (20211203182907).jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Mutton_sold_at_Guoshuhao_Supermarket%2C_Yuandalu_%2820211203182907%29.jpg/1280px-Mutton_sold_at_Guoshuhao_Supermarket%2C_Yuandalu_%2820211203182907%29.jpg",
    // Meats in the display case - panoramio (1184).jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Meats_in_the_display_case_-_panoramio_%281184%29.jpg/1280px-Meats_in_the_display_case_-_panoramio_%281184%29.jpg",
    // Minced meat.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Minced_meat.jpg/1280px-Minced_meat.jpg",
    // Mincemeat Tesco.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Mincemeat_Tesco.jpg/1280px-Mincemeat_Tesco.jpg",
    // Meat packages in a Roman supermarket.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Meat_packages_in_a_Roman_supermarket.jpg/1280px-Meat_packages_in_a_Roman_supermarket.jpg",
    // Granville Island Market - rack of lamb.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Granville_Island_Market_-_rack_of_lamb.jpg/1280px-Granville_Island_Market_-_rack_of_lamb.jpg",
    // Dry salting leg of lamb.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Dry_salting_leg_of_lamb.jpg/1280px-Dry_salting_leg_of_lamb.jpg",
    // -2022-01-06 Lamb loin chops, Trimingham, Norfolk.JPG
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/-2022-01-06_Lamb_loin_chops%2C_Trimingham%2C_Norfolk.JPG/1280px--2022-01-06_Lamb_loin_chops%2C_Trimingham%2C_Norfolk.JPG",
    // Leg of Lamb (13621599753).png
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Leg_of_Lamb_%2813621599753%29.png/1280px-Leg_of_Lamb_%2813621599753%29.png",
    // Lammracks 2.jpg
    "https://upload.wikimedia.org/wikipedia/commons/6/62/Lammracks_2.jpg",
    // Lammentrecote.jpg
    "https://upload.wikimedia.org/wikipedia/commons/6/6d/Lammentrecote.jpg",
    // Lammkotletter.jpg
    "https://upload.wikimedia.org/wikipedia/commons/8/81/Lammkotletter.jpg",
    // Lammracks.jpg
    "https://upload.wikimedia.org/wikipedia/commons/8/8f/Lammracks.jpg",
    // Lammstek.jpg
    "https://upload.wikimedia.org/wikipedia/commons/d/d4/Lammstek.jpg",
  ],
  dishes: [
    // Roast leg of lamb.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Roast_leg_of_lamb.jpg/1280px-Roast_leg_of_lamb.jpg",
    // Rack-of-lambs.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Rack-of-lambs.jpg/1280px-Rack-of-lambs.jpg",
    // Grilled lamb ribs.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Grilled_lamb_ribs.jpg/1280px-Grilled_lamb_ribs.jpg",
    // Grilled lamb ribs 2.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Grilled_lamb_ribs_2.jpg/1280px-Grilled_lamb_ribs_2.jpg",
    // Roast whole lamb (20250130).jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Roast_whole_lamb_%2820250130%29.jpg/1280px-Roast_whole_lamb_%2820250130%29.jpg",
    // Qouzi (Iraqi grilled lamb) - Flickr - Al Jazeera English.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Qouzi_%28Iraqi_grilled_lamb%29_-_Flickr_-_Al_Jazeera_English.jpg/1280px-Qouzi_%28Iraqi_grilled_lamb%29_-_Flickr_-_Al_Jazeera_English.jpg",
    // Lamb haneeth at Marib restaurant, Springfield, Virginia.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Lamb_haneeth_at_Marib_restaurant%2C_Springfield%2C_Virginia.jpg/1280px-Lamb_haneeth_at_Marib_restaurant%2C_Springfield%2C_Virginia.jpg",
    // Mandi Lamb Shank, Lepak @ Sultan, 62 Bussorah St, Singapore (01).jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Mandi_Lamb_Shank%2C_Lepak_%40_Sultan%2C_62_Bussorah_St%2C_Singapore_%2801%29.jpg/1280px-Mandi_Lamb_Shank%2C_Lepak_%40_Sultan%2C_62_Bussorah_St%2C_Singapore_%2801%29.jpg",
    // Arabian Mandi Biryani.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Arabian_Mandi_Biryani.jpg/1280px-Arabian_Mandi_Biryani.jpg",
    // Kabsa 001.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Kabsa_001.jpg/1280px-Kabsa_001.jpg",
    // Mutton Biryani.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Mutton_Biryani.jpg/1280px-Mutton_Biryani.jpg",
    // Lamb Biryani.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Lamb_Biryani.jpg/1280px-Lamb_Biryani.jpg",
    // Kuzu şiş (Şiş kebap).jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Kuzu_%C5%9Fi%C5%9F_%28%C5%9Ei%C5%9F_kebap%29.jpg/1280px-Kuzu_%C5%9Fi%C5%9F_%28%C5%9Ei%C5%9F_kebap%29.jpg",
    // Lamb shish kebab.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Lamb_shish_kebab.jpg/1280px-Lamb_shish_kebab.jpg",
    // Lamb rump - herb-crusted.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Lamb_rump_-_herb-crusted.jpg/1280px-Lamb_rump_-_herb-crusted.jpg",
    // Roast Lamb Rolled with Garlic.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Roast_Lamb_Rolled_with_Garlic.jpg/1280px-Roast_Lamb_Rolled_with_Garlic.jpg",
    // Kabsa 2.JPG
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Kabsa_2.JPG/1280px-Kabsa_2.JPG",
    // Kabsa 1.JPG
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Kabsa_1.JPG/1280px-Kabsa_1.JPG",
    // Kabsa 3.JPG
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Kabsa_3.JPG/1280px-Kabsa_3.JPG",
    // Kabsa (6486384335).jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Kabsa_%286486384335%29.jpg/1280px-Kabsa_%286486384335%29.jpg",
    // Mutton shish kebab.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Mutton_shish_kebab.jpg/1280px-Mutton_shish_kebab.jpg",
    // Arabic Shawarma.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Arabic_Shawarma.jpg/1280px-Arabic_Shawarma.jpg",
    // Iraqi cuisine-Mixed Shawarma platter.jpg
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Iraqi_cuisine-Mixed_Shawarma_platter.jpg/1280px-Iraqi_cuisine-Mixed_Shawarma_platter.jpg",
    // Shami Kabab.JPG
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Shami_Kabab.JPG/1280px-Shami_Kabab.JPG",
  ],
};

// موزّع الصور: مؤشر لكل مجموعة، فلا تُستهلك صورة مرتين.
const cursor = {};
function take(group, count) {
  const list = IMG[group];
  const start = cursor[group] || 0;
  if (start + count > list.length) {
    throw new Error(
      `بنك الصور "${group}" نفد: مطلوب ${count} صورة بعد ${start}, والمتاح ${list.length}.`,
    );
  }
  cursor[group] = start + count;
  return list.slice(start, start + count);
}

// ==================== الحصص ====================
const PORTIONS = [
  {
    key: "whole",
    ar: "ذبيحة كاملة",
    en: "Whole",
    name: (suffix) => `ذبيحة ${suffix} كاملة`,
    nameEn: (en) => `Whole ${en} Sheep`,
    body:
      "تشمل الذبيحة كاملةً بكل أجزائها: الفخذان والكتفان وقفص الضلوع والرقبة " +
      "والفلتو، مع الرأس والكوارع والكبد والطحال عند طلبها.",
  },
  {
    key: "half",
    ar: "نصف ذبيحة",
    en: "Half",
    name: (suffix) => `نصف ذبيحة ${suffix}`,
    nameEn: (en) => `Half ${en} Sheep`,
    body:
      "نصف ذبيحة طولي متكامل: فخذ وكتف ونصف قفص الضلوع مع جزء من الرقبة، " +
      "بتوزيع متوازن بين اللحم والعظم يصلح للطبخ والشوي معاً.",
  },
  {
    key: "third",
    ar: "ثلث ذبيحة",
    en: "Third",
    name: (suffix) => `ثلث ذبيحة ${suffix}`,
    nameEn: (en) => `Third of ${en} Sheep`,
    body:
      "ثلث ذبيحة مختار بعناية ليضم قطعاً متنوعة من الفخذ والكتف والضلوع، " +
      "فلا تكون الحصة عظماً في معظمها كما يحدث عند التقسيم العشوائي.",
  },
];

// ==================== السلالات ====================
const BREEDS = [
  {
    slug: "najdi",
    ar: "نجدي",
    en: "Najdi",
    suffix: "نجدي أصيل",
    imgGroup: "najdi",
    origin: "نجد والقصيم – المملكة العربية السعودية",
    age: "8 – 12 شهراً",
    liveWeight: "50 – 60 كجم",
    shorts: {
      whole:
        "ذبيحة نجدي أصيلة كاملة من أجود سلالات الجزيرة العربية، مختارة لولائم المناسبات الكبرى.",
      half: "نصف ذبيحة نجدي أصيل بلحم أحمر متماسك، تكفي عزيمة عائلية واسعة دون فائض.",
      third:
        "ثلث ذبيحة نجدي أصيل، حصة مختارة تجمع الفخذ والكتف والضلوع لمائدة صغيرة فاخرة.",
    },
    profile:
      "النجدي سيّد الأغنام في وسط المملكة؛ يُعرف برأسه الأسود وقامته الممشوقة " +
      "وحجمه الكبير الذي يفوق أغلب السلالات. لحمه أحمر متماسك، قليل الدهن، " +
      "ذو نكهة عميقة لا تخطئها الذائقة، وهو الخيار الأول لأهل الكرم في الأعراس " +
      "والولائم الكبرى ومناسبات العيد. تُنتقى ذبائحنا من مزارع موثوقة في القصيم " +
      "ونجد، ومن أعمار مثالية تضمن طراوة اللحم مع اكتمال النكهة.",
    prices: { whole: 2500, half: 1350, third: 810 },
    weights: { whole: "20 – 24 كجم", half: "10 – 12 كجم", third: "6.5 – 8 كجم" },
    servings: { whole: "18 – 22 شخصاً", half: "9 – 11 شخصاً", third: "6 – 7 أشخاص" },
    stock: { whole: 9, half: 14, third: 21 },
    rating: 4.9,
    reviews: 63,
    featured: true,
    tags: ["فاخر", "ولائم", "أعراس", "سلالة محلية"],
  },
  {
    slug: "harri",
    ar: "حري",
    en: "Harri",
    suffix: "حري ممتاز",
    imgGroup: "sudani",
    origin: "سلالة سودانية الأصل – مرباة ومجهّزة داخل المملكة",
    age: "6 – 10 أشهر",
    liveWeight: "45 – 55 كجم",
    shorts: {
      whole: "ذبيحة حري ممتازة كاملة بلحم طري ودهن متوازن، الأنسب للمندي والمظبي.",
      half: "نصف ذبيحة حري بلحم سريع النضج ودهن متوازن، خيار الطباخين لموائد الضيافة.",
      third: "ثلث ذبيحة حري بقطع متنوعة طرية، تكفي مندي عائلي بامتياز.",
    },
    profile:
      "الحري سلالة سودانية الأصل استقرت تربيتها في المملكة حتى صارت من أغلى " +
      "الذبائح وأكثرها طلباً على موائد الضيافة. يمتاز بجسم ممتلئ وألية معتدلة " +
      "ولحم طري سريع النضج، مع توازن دقيق بين الشحم واللحم يمنح المندي والمظبي " +
      "مذاقاً غنياً من غير دسامة ثقيلة. يفضّله الطباخون لأنه لا يحتاج تطويلاً " +
      "على النار حتى يستوي.",
    prices: { whole: 2500, half: 1350, third: 810 },
    weights: { whole: "18 – 22 كجم", half: "9 – 11 كجم", third: "6 – 7.5 كجم" },
    servings: { whole: "16 – 20 شخصاً", half: "8 – 10 أشخاص", third: "5 – 7 أشخاص" },
    stock: { whole: 7, half: 12, third: 18 },
    rating: 4.8,
    reviews: 47,
    featured: true,
    tags: ["فاخر", "مندي", "مظبي", "ولائم"],
  },
  {
    slug: "naimi",
    ar: "نعيمي",
    en: "Naimi",
    suffix: "نعيمي فاخر",
    imgGroup: "naimi",
    origin: "المملكة العربية السعودية وبلاد الشام (العواسي)",
    age: "6 – 10 أشهر",
    liveWeight: "40 – 50 كجم",
    shorts: {
      whole: "ذبيحة نعيمي فاخرة كاملة، طازجة ومختارة بعناية، مناسبة للولائم والعزائم.",
      half: "نصف ذبيحة نعيمي فاخر — أشهر سلالة على الموائد السعودية بنكهة غنية ومرق ثقيل.",
      third: "ثلث ذبيحة نعيمي فاخر، حصة متوازنة بين اللحم والعظم لعزيمة صغيرة.",
    },
    profile:
      "النعيمي — ويسمّى العواسي — أشهر السلالات وأوسعها انتشاراً في المملكة " +
      "والخليج، ويُعرف بصوفه الكريمي ووجهه البني وأليته الكبيرة. لحمه غني " +
      "بالنكهة، متوسط الدهن، ويعطي مرقاً ثقيلاً مميزاً؛ ولهذا يُعد الخيار " +
      "المتوازن بين الجودة والسعر في موائد العزائم. ذبائحنا من قطعان مرباة على " +
      "الشعير والبرسيم، فيأتي اللحم ممتلئاً ومتماسكاً.",
    prices: { whole: 1350, half: 810, third: 675 },
    weights: { whole: "16 – 19 كجم", half: "8 – 9.5 كجم", third: "5 – 6.5 كجم" },
    servings: { whole: "14 – 18 شخصاً", half: "7 – 9 أشخاص", third: "5 – 6 أشخاص" },
    stock: { whole: 16, half: 24, third: 33 },
    rating: 4.8,
    reviews: 128,
    featured: true,
    tags: ["الأكثر طلباً", "عزائم", "سلالة محلية"],
  },
  {
    slug: "sawakni",
    ar: "سواكني",
    en: "Sawakni",
    suffix: "سواكني",
    imgGroup: "sudani",
    origin: "السودان – يُنسب إلى ميناء سواكن",
    age: "7 – 11 شهراً",
    liveWeight: "45 – 55 كجم",
    shorts: {
      whole: "ذبيحة سواكني كاملة كبيرة الحجم بلحم أحمر خفيف الدهن، وفيرة العطاء.",
      half: "نصف ذبيحة سواكني بلحم أحمر وفير قليل الدهن، يناسب الكبسة والقدر والولائم.",
      third: "ثلث ذبيحة سواكني قليل الدهن، حصة عملية بسعر مدروس.",
    },
    profile:
      "السواكني سلالة سودانية يميزها طول القامة وكبر الحجم ووفرة اللحم الأحمر " +
      "مع نسبة دهن منخفضة. تُعد من أفضل الخيارات حين يكون عدد الضيوف كبيراً، " +
      "إذ تعطي الذبيحة الواحدة كمية لحم أعلى من غيرها عند سعر متقارب. لحمها " +
      "مناسب للكبسة والقدر والمندي، ويحتفظ بقوامه بعد الطهي الطويل.",
    prices: { whole: 1350, half: 810, third: 675 },
    weights: { whole: "17 – 20 كجم", half: "8.5 – 10 كجم", third: "5.5 – 6.5 كجم" },
    servings: { whole: "15 – 18 شخصاً", half: "8 – 9 أشخاص", third: "5 – 6 أشخاص" },
    stock: { whole: 13, half: 19, third: 27 },
    rating: 4.7,
    reviews: 74,
    featured: true,
    tags: ["وفرة لحم", "عزائم كبيرة", "قليل الدهن"],
  },
  {
    slug: "turki",
    ar: "تركي",
    en: "Turkish",
    suffix: "تركي مختار",
    imgGroup: "turki",
    origin: "تركيا – مراعي الأناضول",
    age: "6 – 9 أشهر",
    liveWeight: "38 – 45 كجم",
    shorts: {
      whole: "ذبيحة تركية كاملة مختارة، جودة مستوردة بسعر مناسب للعزائم المتوسطة.",
      half: "نصف ذبيحة تركية مبرّدة بلحم فاتح طري، مناسبة للعزائم العائلية.",
      third: "ثلث ذبيحة تركية، حصة اقتصادية طرية تكفي وجبة عائلية كاملة.",
    },
    profile:
      "تأتي الذبائح التركية من قطعان مرباة في المراعي الأناضولية المفتوحة، " +
      "بحجم متوسط ولحم فاتح اللون طري القوام. تمثّل خياراً عملياً للعزائم " +
      "العائلية والمناسبات المتوسطة، وتوازن بين جودة عالية وسعر أقل من " +
      "السلالات المحلية. تصل مبرّدة لا مجمّدة، وتُجهّز عند الطلب لا قبله.",
    prices: { whole: 1350, half: 810, third: 675 },
    weights: { whole: "14 – 17 كجم", half: "7 – 8.5 كجم", third: "4.5 – 5.5 كجم" },
    servings: { whole: "12 – 15 شخصاً", half: "6 – 8 أشخاص", third: "4 – 5 أشخاص" },
    stock: { whole: 18, half: 26, third: 31 },
    rating: 4.6,
    reviews: 52,
    featured: false,
    tags: ["مستورد", "عزائم عائلية"],
  },
  {
    slug: "romani",
    ar: "رومي",
    en: "Romanian",
    suffix: "رومي طازج",
    imgGroup: "romani",
    origin: "رومانيا – مراعي جبال الكاربات",
    age: "5 – 8 أشهر",
    liveWeight: "32 – 40 كجم",
    shorts: {
      whole: "ذبيحة رومانية كاملة طازجة، خيار اقتصادي مثالي للكميات والولائم الكبيرة.",
      half: "نصف ذبيحة رومانية طازجة، لحم طري قليل الدهن بتكلفة محسوبة.",
      third: "ثلث ذبيحة رومانية، أخف حصة سعراً في المتجر مع طراوة محفوظة.",
    },
    profile:
      "الذبائح الرومانية خيار اقتصادي معروف في السوق السعودي، تأتي من مراعي " +
      "جبال الكاربات بحجم صغير إلى متوسط ولحم طري قليل الدهن. تناسب المطاعم " +
      "والاستراحات والمناسبات التي تحتاج عدداً كبيراً من الذبائح بتكلفة محسوبة، " +
      "مع الحفاظ على الطراوة والنظافة وسلسلة تبريد غير منقطعة.",
    prices: { whole: 810, half: 540, third: 405 },
    weights: { whole: "12 – 15 كجم", half: "6 – 7.5 كجم", third: "4 – 5 كجم" },
    servings: { whole: "10 – 13 شخصاً", half: "5 – 7 أشخاص", third: "3 – 4 أشخاص" },
    stock: { whole: 28, half: 35, third: 44 },
    rating: 4.4,
    reviews: 96,
    featured: false,
    tags: ["اقتصادي", "كميات", "مستورد"],
  },
  {
    slug: "australi",
    ar: "أسترالي",
    en: "Australian",
    suffix: "أسترالي مبرّد",
    imgGroup: "australi",
    origin: "أستراليا – مراعٍ مفتوحة",
    age: "5 – 8 أشهر",
    liveWeight: "30 – 38 كجم",
    shorts: {
      whole: "ذبيحة أسترالية كاملة مبرّدة بلحم فاتح طري، خيار اقتصادي نظيف.",
      half: "نصف ذبيحة أسترالية مبرّدة، نكهة هادئة تناسب الاستهلاك المنزلي.",
      third: "ثلث ذبيحة أسترالية، حصة صغيرة عملية بسعر في المتناول.",
    },
    profile:
      "تُربّى الأغنام الأسترالية في مراعٍ مفتوحة وتصل المملكة عبر سلسلة تبريد " +
      "متصلة تحافظ على طراوتها. لحمها فاتح اللون، ناعم الملمس، خفيف الرائحة — " +
      "ما يجعلها مناسبة لمن يفضّل نكهة أهدأ من نكهة الأغنام المحلية، " +
      "وللاستهلاك المنزلي المنتظم والمطاعم.",
    prices: { whole: 810, half: 540, third: 405 },
    weights: { whole: "11 – 14 كجم", half: "5.5 – 7 كجم", third: "3.5 – 4.5 كجم" },
    servings: { whole: "9 – 12 شخصاً", half: "5 – 6 أشخاص", third: "3 – 4 أشخاص" },
    stock: { whole: 32, half: 41, third: 38 },
    rating: 4.3,
    reviews: 61,
    featured: false,
    tags: ["اقتصادي", "مبرّد", "مستورد"],
  },
  {
    slug: "somali",
    ar: "صومالي",
    en: "Somali",
    suffix: "صومالي طازج",
    imgGroup: "somali",
    origin: "القرن الأفريقي",
    age: "5 – 8 أشهر",
    liveWeight: "30 – 36 كجم",
    shorts: {
      whole: "ذبيحة صومالية كاملة طازجة برأس أسود وجسم أبيض، لحم طري وسعر مناسب.",
      half: "نصف ذبيحة صومالية طازجة بلحم لطيف النكهة، مناسبة للعزائم الصغيرة.",
      third: "ثلث ذبيحة صومالية، حصة منزلية اقتصادية طازجة.",
    },
    profile:
      "الصومالي سلالة أفريقية يميزها الرأس الأسود والجسم الأبيض والحجم المتوسط. " +
      "لحمها طري قليل الدهن ونكهته لطيفة غير حادة، وتُعد من الخيارات الاقتصادية " +
      "المحببة في الأسواق السعودية، خصوصاً للعزائم الصغيرة والمتوسطة " +
      "وللاستهلاك المنزلي.",
    prices: { whole: 810, half: 540, third: 405 },
    weights: { whole: "11 – 13 كجم", half: "5.5 – 6.5 كجم", third: "3.5 – 4.5 كجم" },
    servings: { whole: "9 – 11 شخصاً", half: "5 – 6 أشخاص", third: "3 – 4 أشخاص" },
    stock: { whole: 24, half: 30, third: 36 },
    rating: 4.4,
    reviews: 58,
    featured: false,
    tags: ["اقتصادي", "عزائم صغيرة"],
  },
];

// النصوص المشتركة في كل وصف كامل — الخدمة نفسها لكل الذبائح.
const SERVICE_BLOCK =
  "التقطيع والتغليف:\n" +
  "يُقطّع حسب رغبتك — أرباع، أو تقطيع مندي، أو مضغوط، أو مفروم، أو قطع صغيرة — " +
  "ويُغلّف مفرّغاً من الهواء داخل صناديق مبرّدة.\n\n" +
  "الذبح والتجهيز:\n" +
  "ذبح حلال بإشراف شرعي في مسلخ معتمد، ثم سلخ وتنظيف وتبريد كامل قبل التسليم. " +
  "لا نذبح إلا بعد استلام الطلب.\n\n" +
  "التوصيل:\n" +
  "توصيل مبرّد خلال 24 ساعة داخل المدينة، وخلال 48 ساعة لبقية مناطق المملكة.";

const FEATURES = [
  "ذبح حلال بإشراف شرعي في مسلخ معتمد",
  "تقطيع مجاني حسب الطلب",
  "تغليف مفرّغ من الهواء",
  "توصيل مبرّد خلال 24 ساعة",
  "ضمان الطراوة أو الاستبدال",
];

function build() {
  const products = [];
  for (const breed of BREEDS) {
    for (const portion of PORTIONS) {
      const short = breed.shorts[portion.key];
      products.push({
        name: portion.name(breed.suffix),
        nameEn: portion.nameEn(breed.en),
        slug: `${breed.slug}-${portion.key}-sheep`,
        shortDescription: short,
        description: [short, breed.profile, portion.body, SERVICE_BLOCK].join("\n\n"),
        price: breed.prices[portion.key],
        stock: breed.stock[portion.key],
        featured: breed.featured && portion.key === "whole",
        brand: breed.ar,
        rating: breed.rating,
        reviewCount: breed.reviews,
        features: FEATURES,
        tags: ["ذبائح", breed.ar, portion.ar, "لحم طازج", "توصيل مبرّد", ...breed.tags],
        specs: {
          "السلالة": breed.ar,
          "المنشأ": breed.origin,
          "نوع الحصة": portion.ar,
          "الوزن الصافي بعد الذبح": breed.weights[portion.key],
          "الوزن الحي للذبيحة": breed.liveWeight,
          "تكفي لعدد": breed.servings[portion.key],
          "العمر عند الذبح": breed.age,
          "طريقة الذبح": "حلال بإشراف شرعي",
          "الحالة": "طازج مبرّد — غير مجمّد",
          "التقطيع": "حسب الطلب (أرباع / مندي / مضغوط / مفروم)",
          "التغليف": "تغليف مفرّغ من الهواء داخل صندوق مبرّد",
        },
        // [0] الصورة الرئيسية = حيوان من السلالة نفسها، ثم لقطة ثانية للسلالة،
        // ثم قطعيات نيئة، ثم طبق جاهز. لا تتكرر صورة واحدة بين منتجين.
        images: [...take(breed.imgGroup, 2), ...take("cuts", 1), ...take("dishes", 1)],
      });
    }
  }
  return products;
}

module.exports = { products: build(), BREEDS, PORTIONS };
