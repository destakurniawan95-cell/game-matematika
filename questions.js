// Math Adventure Indonesia - Question Generator Library
// Dynamically generates questions for grades 1-6 and subtopics.

const QuestionsGenerator = {
  // Helper to generate a random integer in range [min, max]
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  // Helper to shuffle array
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  },

  // Helper to generate multiple choices (1 correct, 3 incorrect)
  generateChoices(correctVal, deltaRange = 10, isFloat = false, precision = 2) {
    const choices = new Set();
    
    let correctStr;
    if (isFloat) {
      correctStr = Number(correctVal).toFixed(precision);
    } else {
      correctStr = Math.round(correctVal).toString();
    }
    choices.add(correctStr);

    while (choices.size < 4) {
      let offset = this.randomInt(-deltaRange, deltaRange);
      if (offset === 0) offset = this.randomInt(1, 2) * (Math.random() < 0.5 ? -1 : 1);
      
      let wrongVal;
      if (isFloat) {
        wrongVal = Number(correctVal) + (offset * 0.1);
        if (wrongVal < 0) wrongVal = Math.abs(wrongVal); // Keep it positive if applicable
        choices.add(Number(wrongVal).toFixed(precision));
      } else {
        wrongVal = Math.round(Number(correctVal)) + offset;
        choices.add(wrongVal.toString());
      }
    }

    return this.shuffleArray(Array.from(choices));
  },

  // Generate question based on grade and subtopic
  generate(grade, topic) {
    let question = "";
    let answer = "";
    let options = [];
    let hint = "";

    switch (grade) {
      case 1:
        ({ question, answer, options, hint } = this.generateGrade1(topic));
        break;
      case 2:
        ({ question, answer, options, hint } = this.generateGrade2(topic));
        break;
      case 3:
        ({ question, answer, options, hint } = this.generateGrade3(topic));
        break;
      case 4:
        ({ question, answer, options, hint } = this.generateGrade4(topic));
        break;
      case 5:
        ({ question, answer, options, hint } = this.generateGrade5(topic));
        break;
      case 6:
        ({ question, answer, options, hint } = this.generateGrade6(topic));
        break;
      default:
        // Fallback
        question = "1 + 1 = ?";
        answer = "2";
        options = ["1", "2", "3", "4"];
        hint = "Penjumlahan dasar.";
    }

    return { question, answer, options, hint };
  },

  generateGrade1(topic) {
    let question, answer, options, hint;
    const subtopics = ["mengenal_angka", "penjumlahan", "pengurangan", "tebak_angka", "cocokkan_bentuk"];
    const activeTopic = topic || subtopics[this.randomInt(0, subtopics.length - 1)];

    if (activeTopic === "mengenal_angka") {
      const num = this.randomInt(1, 10);
      const style = this.randomInt(1, 3);
      if (style === 1) {
        const symbols = "⭐".repeat(num);
        question = `Berapa banyak bintang berikut ini?\n${symbols}`;
        answer = num.toString();
        options = this.generateChoices(num, 3);
        hint = "Hitung satu per satu dari kiri ke kanan.";
      } else if (style === 2) {
        question = `Angka setelah ${num} adalah?`;
        answer = (num + 1).toString();
        options = this.generateChoices(num + 1, 3);
        hint = `Hitung maju 1 langkah dari angka ${num}.`;
      } else {
        const start = this.randomInt(1, 7);
        question = `Lengkapi urutan angka berikut: ${start}, ${start + 1}, ?, ${start + 3}`;
        answer = (start + 2).toString();
        options = this.generateChoices(start + 2, 3);
        hint = "Cari angka yang berada di antara angka sebelum dan sesudahnya.";
      }
    } else if (activeTopic === "penjumlahan") {
      const a = this.randomInt(1, 10);
      const b = this.randomInt(1, 9);
      question = `${a} + ${b} = ?`;
      answer = (a + b).toString();
      options = this.generateChoices(a + b, 4);
      hint = "Gabungkan kedua kumpulan benda untuk menghitung jumlahnya.";
    } else if (activeTopic === "pengurangan") {
      const a = this.randomInt(5, 10);
      const b = this.randomInt(1, a - 1);
      question = `${a} - ${b} = ?`;
      answer = (a - b).toString();
      options = this.generateChoices(a - b, 4);
      hint = "Ambil atau coret benda sebanyak angka pengurang.";
    } else if (activeTopic === "tebak_angka") {
      const target = this.randomInt(2, 9);
      question = `Aku adalah angka di antara ${target - 1} dan ${target + 1}. Siapakah aku?`;
      answer = target.toString();
      options = this.shuffleArray([target.toString(), (target - 2).toString(), (target + 2).toString(), (target + 3).toString()]);
      hint = "Angka ini lebih besar dari angka pertama dan lebih kecil dari angka kedua.";
    } else { // cocokkan_bentuk
      const shapes = [
        { name: "Segitiga", desc: "Bentuk yang memiliki 3 sisi dan 3 sudut adalah?" },
        { name: "Persegi", desc: "Bentuk yang memiliki 4 sisi sama panjang adalah?" },
        { name: "Lingkaran", desc: "Bentuk bulat seperti koin atau roda adalah?" },
        { name: "Persegi Panjang", desc: "Bentuk dengan 4 sudut siku-siku dan sisi yang berhadapan sama panjang adalah?" }
      ];
      const selected = shapes[this.randomInt(0, shapes.length - 1)];
      question = selected.desc;
      answer = selected.name;
      options = this.shuffleArray(shapes.map(s => s.name));
      hint = `Ingat ciri-ciri bentuk geometris: ${selected.name.toLowerCase()} memiliki ciri khas tersendiri.`;
    }

    return { question, answer, options, hint };
  },

  generateGrade2(topic) {
    let question, answer, options, hint;
    const subtopics = ["penjumlahan_3_digit", "pengurangan", "perkalian_dasar", "pembagian_sederhana"];
    const activeTopic = topic || subtopics[this.randomInt(0, subtopics.length - 1)];

    if (activeTopic === "penjumlahan_3_digit") {
      const a = this.randomInt(100, 400);
      const b = this.randomInt(100, 400);
      question = `${a} + ${b} = ?`;
      answer = (a + b).toString();
      options = this.generateChoices(a + b, 15);
      hint = "Jumlahkan dari satuan, kemudian puluhan, lalu ratusan.";
    } else if (activeTopic === "pengurangan") {
      const a = this.randomInt(100, 500);
      const b = this.randomInt(10, a - 10);
      question = `${a} - ${b} = ?`;
      answer = (a - b).toString();
      options = this.generateChoices(a - b, 15);
      hint = "Kurangkan dari satuan ke ratusan. Pinjam dari kolom sebelah kiri jika perlu.";
    } else if (activeTopic === "perkalian_dasar") {
      const a = this.randomInt(2, 5);
      const b = this.randomInt(2, 9);
      question = `${a} × ${b} = ?`;
      answer = (a * b).toString();
      options = this.generateChoices(a * b, 6);
      hint = `Perkalian adalah penjumlahan berulang. Contoh: ${a} × ${b} artinya ${b} dijumlahkan sebanyak ${a} kali.`;
    } else { // pembagian_sederhana
      const b = this.randomInt(2, 5);
      const ans = this.randomInt(2, 6);
      const a = b * ans;
      question = `${a} ÷ ${b} = ?`;
      answer = ans.toString();
      options = this.generateChoices(ans, 3);
      hint = `Pembagian adalah kebalikan dari perkalian. Berapa dikali ${b} menghasilkan ${a}?`;
    }

    return { question, answer, options, hint };
  },

  generateGrade3(topic) {
    let question, answer, options, hint;
    const subtopics = ["perkalian", "pembagian", "pecahan_sederhana", "waktu_dan_jam"];
    const activeTopic = topic || subtopics[this.randomInt(0, subtopics.length - 1)];

    if (activeTopic === "perkalian") {
      const a = this.randomInt(6, 12);
      const b = this.randomInt(3, 9);
      question = `${a} × ${b} = ?`;
      answer = (a * b).toString();
      options = this.generateChoices(a * b, 8);
      hint = "Gunakan perkalian bersusun untuk menghitung hasilnya.";
    } else if (activeTopic === "pembagian") {
      const b = this.randomInt(4, 9);
      const ans = this.randomInt(3, 12);
      const a = b * ans;
      question = `${a} ÷ ${b} = ?`;
      answer = ans.toString();
      options = this.generateChoices(ans, 4);
      hint = `Cari angka yang jika dikalikan dengan ${b} akan menghasilkan ${a}.`;
    } else if (activeTopic === "pecahan_sederhana") {
      const style = this.randomInt(1, 2);
      if (style === 1) {
        const num = this.randomInt(1, 4);
        const den = this.randomInt(num + 1, 8);
        question = `Pecahan ${num}/${den} dibaca...`;
        
        const readWords = {
          1: "seper", 2: "dua per ", 3: "tiga per ", 4: "empat per ",
          5: "lima per ", 6: "enam per ", 7: "tujuh per ", 8: "delapan per "
        };
        const readDen = {
          2: "dua", 3: "tiga", 4: "empat", 5: "lima", 6: "enam", 7: "tujuh", 8: "delapan"
        };
        
        if (num === 1) {
          answer = readWords[1] + readDen[den];
        } else {
          answer = readWords[num] + readDen[den];
        }
        
        // Generate options
        const incorrects = new Set();
        while (incorrects.size < 3) {
          const wN = this.randomInt(1, 4);
          const wD = this.randomInt(wN + 1, 8);
          let wAns = (wN === 1) ? readWords[1] + readDen[wD] : readWords[wN] + readDen[wD];
          if (wAns !== answer) incorrects.add(wAns);
        }
        options = this.shuffleArray([answer, ...Array.from(incorrects)]);
        hint = "Pembilang (atas) dibaca dahulu, lalu diikuti 'per' dan penyebut (bawah).";
      } else {
        const optionsMap = [
          { q: "Setengah bagian dilambangkan dengan pecahan...", a: "1/2" },
          { q: "Sepertiga bagian dilambangkan dengan pecahan...", a: "1/3" },
          { q: "Seperempat bagian dilambangkan dengan pecahan...", a: "1/4" },
          { q: "Tiga perempat bagian dilambangkan dengan pecahan...", a: "3/4" }
        ];
        const sel = optionsMap[this.randomInt(0, optionsMap.length - 1)];
        question = sel.q;
        answer = sel.a;
        options = this.shuffleArray(["1/2", "1/3", "1/4", "3/4", "2/3"]);
        if (!options.includes(answer)) options[0] = answer;
        hint = "Angka pembilang adalah bagian yang diambil, penyebut adalah total seluruh bagian.";
      }
    } else { // waktu_dan_jam
      const style = this.randomInt(1, 2);
      if (style === 1) {
        const hour = this.randomInt(1, 11);
        const add = this.randomInt(1, 3);
        question = `Jika sekarang pukul ${hour.toString().padStart(2, '0')}.00, maka ${add} jam lagi adalah pukul?`;
        answer = ((hour + add) % 12 || 12).toString().padStart(2, '0') + ".00";
        
        const ansNum = (hour + add) % 12 || 12;
        options = [
          ansNum.toString().padStart(2, '0') + ".00",
          ((ansNum + 1) % 12 || 12).toString().padStart(2, '0') + ".00",
          ((ansNum - 1) % 12 || 12).toString().padStart(2, '0') + ".00",
          ((ansNum + 2) % 12 || 12).toString().padStart(2, '0') + ".00"
        ];
        options = this.shuffleArray(options);
        hint = "Tambahkan angka jam sekarang dengan jumlah jam yang akan datang.";
      } else {
        const pmHour = this.randomInt(13, 22);
        question = `Pukul ${pmHour}.00 sama dengan pukul... sore/malam.`;
        answer = (pmHour - 12).toString();
        options = this.generateChoices(pmHour - 12, 3);
        hint = "Untuk format 12 jam (sore/malam), kurangi jam 24-jam dengan 12.";
      }
    }

    return { question, answer, options, hint };
  },

  generateGrade4(topic) {
    let question, answer, options, hint;
    const subtopics = ["pecahan", "keliling", "luas", "faktor_dan_kelipatan"];
    const activeTopic = topic || subtopics[this.randomInt(0, subtopics.length - 1)];

    if (activeTopic === "pecahan") {
      const denom = this.randomInt(3, 8);
      const a = this.randomInt(1, denom - 1);
      const b = this.randomInt(1, denom - a);
      if (b === 0) {
        question = `Manakah pecahan yang lebih besar dari 1/2?`;
        answer = "3/4";
        options = this.shuffleArray(["3/4", "1/3", "1/4", "2/5"]);
        hint = "Bandingkan nilai pecahan dengan mengubahnya ke penyebut yang sama.";
      } else {
        question = `${a}/${denom} + ${b}/${denom} = ?`;
        answer = `${a + b}/${denom}`;
        options = this.shuffleArray([
          `${a + b}/${denom}`,
          `${a}/${denom}`,
          `${Math.abs(a - b) || 1}/${denom}`,
          `${a + b}/${denom + denom}`
        ]);
        hint = "Jika penyebutnya sudah sama, cukup jumlahkan pembilangnya saja.";
      }
    } else if (activeTopic === "keliling") {
      const style = this.randomInt(1, 2);
      if (style === 1) {
        const side = this.randomInt(4, 15);
        question = `Berapakah keliling persegi yang memiliki panjang sisi ${side} cm?`;
        answer = (side * 4).toString();
        options = this.generateChoices(side * 4, 10);
        hint = "Keliling persegi = 4 × sisi.";
      } else {
        const p = this.randomInt(5, 12);
        const l = this.randomInt(3, p - 1);
        question = `Berapakah keliling persegi panjang dengan panjang ${p} cm dan lebar ${l} cm?`;
        answer = (2 * (p + l)).toString();
        options = this.generateChoices(2 * (p + l), 12);
        hint = "Keliling persegi panjang = 2 × (panjang + lebar).";
      }
    } else if (activeTopic === "luas") {
      const style = this.randomInt(1, 2);
      if (style === 1) {
        const side = this.randomInt(3, 10);
        question = `Berapakah luas persegi yang memiliki panjang sisi ${side} cm?`;
        answer = (side * side).toString();
        options = this.generateChoices(side * side, 15);
        hint = "Luas persegi = sisi × sisi.";
      } else {
        const p = this.randomInt(5, 12);
        const l = this.randomInt(3, p - 1);
        question = `Berapakah luas persegi panjang dengan panjang ${p} cm dan lebar ${l} cm?`;
        answer = (p * l).toString();
        options = this.generateChoices(p * l, 15);
        hint = "Luas persegi panjang = panjang × lebar.";
      }
    } else { // faktor_dan_kelipatan
      const style = this.randomInt(1, 2);
      if (style === 1) {
        const nums = [
          { a: 4, b: 6, kpk: 12 },
          { a: 6, b: 8, kpk: 24 },
          { a: 3, b: 5, kpk: 15 },
          { a: 5, b: 10, kpk: 10 },
          { a: 8, b: 12, kpk: 24 }
        ];
        const sel = nums[this.randomInt(0, nums.length - 1)];
        question = `Kelipatan Persekutuan Terkecil (KPK) dari ${sel.a} dan ${sel.b} adalah?`;
        answer = sel.kpk.toString();
        options = this.generateChoices(sel.kpk, 10);
        hint = "Cari kelipatan dari kedua bilangan lalu tentukan kelipatan terkecil yang sama.";
      } else {
        const nums = [
          { a: 12, b: 18, fpb: 6 },
          { a: 15, b: 25, fpb: 5 },
          { a: 24, b: 36, fpb: 12 },
          { a: 8, b: 20, fpb: 4 },
          { a: 9, b: 27, fpb: 9 }
        ];
        const sel = nums[this.randomInt(0, nums.length - 1)];
        question = `Faktor Persekutuan Terbesar (FPB) dari ${sel.a} dan ${sel.b} adalah?`;
        answer = sel.fpb.toString();
        options = this.generateChoices(sel.fpb, 5);
        hint = "Cari semua faktor pembagi dari kedua bilangan lalu pilih faktor terbesar yang sama.";
      }
    }

    return { question, answer, options, hint };
  },

  generateGrade5(topic) {
    let question, answer, options, hint;
    const subtopics = ["desimal", "persentase", "volume", "operasi_campuran"];
    const activeTopic = topic || subtopics[this.randomInt(0, subtopics.length - 1)];

    if (activeTopic === "desimal") {
      const style = this.randomInt(1, 2);
      if (style === 1) {
        const a = this.randomInt(1, 9) / 10;
        const b = this.randomInt(1, 9) / 10;
        question = `${a.toFixed(1)} + ${b.toFixed(1)} = ?`;
        answer = (a + b).toFixed(1);
        options = this.generateChoices(a + b, 5, true, 1);
        hint = "Sejajarkan tanda koma sebelum menjumlahkan bilangan desimal.";
      } else {
        const val = this.randomInt(1, 4);
        question = `Bentuk desimal dari pecahan ${val}/5 adalah?`;
        answer = (val / 5).toFixed(1);
        options = this.shuffleArray(["0.2", "0.4", "0.6", "0.8", "0.5"]);
        if (!options.includes(answer)) options[0] = answer;
        hint = "Ubah penyebut pecahan menjadi persepuluh (kali pembilang dan penyebut dengan 2).";
      }
    } else if (activeTopic === "persentase") {
      const pct = [10, 20, 25, 50, 75][this.randomInt(0, 4)];
      const total = [100, 200, 150, 400, 80][this.randomInt(0, 4)];
      question = `${pct}% dari ${total} adalah?`;
      answer = ((pct / 100) * total).toString();
      options = this.generateChoices((pct / 100) * total, 20);
      hint = `Persen artinya per seratus. Kalikan pecahan ${pct}/100 dengan ${total}.`;
    } else if (activeTopic === "volume") {
      const style = this.randomInt(1, 2);
      if (style === 1) {
        const s = this.randomInt(3, 6);
        question = `Berapakah volume kubus yang memiliki panjang rusuk ${s} cm?`;
        answer = (s * s * s).toString();
        options = this.generateChoices(s * s * s, 30);
        hint = "Volume kubus = sisi × sisi × sisi (s³).";
      } else {
        const p = this.randomInt(5, 8);
        const l = this.randomInt(3, 4);
        const t = this.randomInt(2, 5);
        question = `Berapakah volume balok dengan panjang ${p} cm, lebar ${l} cm, dan tinggi ${t} cm?`;
        answer = (p * l * t).toString();
        options = this.generateChoices(p * l * t, 20);
        hint = "Volume balok = panjang × lebar × tinggi.";
      }
    } else { // operasi_campuran
      const a = this.randomInt(5, 15);
      const b = this.randomInt(2, 6);
      const c = this.randomInt(2, 5);
      const style = this.randomInt(1, 2);
      if (style === 1) {
        question = `${a} + ${b} × ${c} = ?`;
        answer = (a + (b * c)).toString();
        options = this.generateChoices(a + (b * c), 10);
        hint = "Dahulukan operasi perkalian sebelum penjumlahan.";
      } else {
        question = `(${a} - ${b}) × ${c} = ?`;
        answer = ((a - b) * c).toString();
        options = this.generateChoices((a - b) * c, 10);
        hint = "Kerjakan operasi di dalam kurung terlebih dahulu.";
      }
    }

    return { question, answer, options, hint };
  },

  generateGrade6(topic) {
    let question, answer, options, hint;
    const subtopics = ["bilangan_bulat", "perbandingan", "skala", "kecepatan", "persiapan_ujian"];
    const activeTopic = topic || subtopics[this.randomInt(0, subtopics.length - 1)];

    if (activeTopic === "bilangan_bulat") {
      const style = this.randomInt(1, 3);
      if (style === 1) {
        const a = this.randomInt(-10, -1);
        const b = this.randomInt(5, 15);
        question = `${a} + ${b} = ?`;
        answer = (a + b).toString();
        options = this.generateChoices(a + b, 8);
        hint = "Menambahkan bilangan negatif sama dengan bergerak ke kanan pada garis bilangan.";
      } else if (style === 2) {
        const a = this.randomInt(3, 10);
        const b = this.randomInt(-8, -2);
        question = `${a} - (${b}) = ?`;
        answer = (a - b).toString();
        options = this.generateChoices(a - b, 8);
        hint = "Pengurangan dengan bilangan negatif sama dengan penjumlahan biasa.";
      } else {
        const a = this.randomInt(-5, -2);
        const b = this.randomInt(-6, -2);
        question = `(${a}) × (${b}) = ?`;
        answer = (a * b).toString();
        options = this.generateChoices(a * b, 10);
        hint = "Perkalian dua bilangan negatif menghasilkan bilangan positif.";
      }
    } else if (activeTopic === "perbandingan") {
      const ratioA = this.randomInt(2, 3);
      const ratioB = this.randomInt(4, 5);
      const mult = this.randomInt(5, 12) * 1000;
      const valA = ratioA * mult;
      const valB = ratioB * mult;
      
      const style = this.randomInt(1, 2);
      if (style === 1) {
        question = `Perbandingan uang Andi dan Budi adalah ${ratioA}:${ratioB}. Jika uang Andi Rp ${valA.toLocaleString('id-ID')}, berapakah uang Budi?`;
        answer = `Rp ${valB.toLocaleString('id-ID')}`;
        options = this.shuffleArray([
          `Rp ${valB.toLocaleString('id-ID')}`,
          `Rp ${(valB + 5000).toLocaleString('id-ID')}`,
          `Rp ${(valB - 5000).toLocaleString('id-ID')}`,
          `Rp ${(valB + 10000).toLocaleString('id-ID')}`
        ]);
        hint = `Gunakan perbandingan: Uang Budi = (${ratioB} / ${ratioA}) × Uang Andi.`;
      } else {
        const total = valA + valB;
        question = `Perbandingan umur Kakak dan Adik adalah ${ratioB}:${ratioA}. Jika jumlah umur mereka ${ratioA + ratioB}0 tahun, berapakah umur Adik?`;
        answer = (ratioA * 10).toString();
        options = this.generateChoices(ratioA * 10, 5);
        hint = "Umur Adik = (Rasio Adik / Total Rasio) × Total Umur.";
      }
    } else if (activeTopic === "skala") {
      const scale = [100000, 200000, 500000][this.randomInt(0, 2)];
      const mapDist = this.randomInt(3, 8);
      const realDistKm = (mapDist * scale) / 100000;
      
      const style = this.randomInt(1, 2);
      if (style === 1) {
        question = `Jarak kota A ke B pada peta dengan skala 1 : ${scale.toLocaleString('id-ID')} adalah ${mapDist} cm. Berapakah jarak sebenarnya dalam km?`;
        answer = `${realDistKm} km`;
        options = this.shuffleArray([
          `${realDistKm} km`,
          `${realDistKm * 10} km`,
          `${realDistKm / 2} km`,
          `${realDistKm + 5} km`
        ]);
        hint = "Jarak sebenarnya = Jarak pada peta × Skala. Ingat untuk mengubah satuan cm ke km (bagi 100.000).";
      } else {
        question = `Jarak sebenarnya 2 kota adalah ${realDistKm} km. Berapakah jarak pada peta dengan skala 1 : ${scale.toLocaleString('id-ID')}?`;
        answer = `${mapDist} cm`;
        options = this.shuffleArray([
          `${mapDist} cm`,
          `${mapDist + 2} cm`,
          `${mapDist - 1} cm`,
          `${mapDist * 2} cm`
        ]);
        hint = "Jarak peta = Jarak sebenarnya (dalam cm) ÷ Skala.";
      }
    } else if (activeTopic === "kecepatan") {
      const t = this.randomInt(2, 4); // hours
      const v = [40, 50, 60, 80][this.randomInt(0, 3)]; // speed km/h
      const s = v * t; // distance
      
      const style = this.randomInt(1, 2);
      if (style === 1) {
        question = `Sebuah mobil menempuh jarak ${s} km dalam waktu ${t} jam. Berapakah kecepatan mobil tersebut?`;
        answer = `${v} km/jam`;
        options = this.shuffleArray([
          `${v} km/jam`,
          `${v - 10} km/jam`,
          `${v + 10} km/jam`,
          `${Math.round(s / (t+1))} km/jam`
        ]);
        hint = "Kecepatan = Jarak ÷ Waktu.";
      } else {
        question = `Budi berkendara dengan kecepatan ${v} km/jam selama ${t} jam. Jarak yang ditempuh Budi adalah?`;
        answer = `${s} km`;
        options = this.shuffleArray([
          `${s} km`,
          `${s - 20} km`,
          `${s + 20} km`,
          `${s * 2} km`
        ]);
        hint = "Jarak = Kecepatan × Waktu.";
      }
    } else { // persiapan_ujian (operasi campuran bilangan bulat, pecahan, desimal, persentase)
      const style = this.randomInt(1, 2);
      if (style === 1) {
        question = `Hasil dari 3/4 + 0.5 - 25% adalah?`;
        answer = "1";
        options = this.shuffleArray(["1", "0.75", "1.25", "1.5"]);
        hint = "Ubah semua bentuk pecahan dan persen menjadi bentuk desimal terlebih dahulu (3/4 = 0.75, 25% = 0.25).";
      } else {
        question = `Hasil dari -15 + 8 × (-2) = ?`;
        answer = "-31";
        options = this.shuffleArray(["-31", "-46", "14", "-14"]);
        hint = "Kerjakan perkalian terlebih dahulu: 8 × (-2) = -16. Kemudian hitung -15 + (-16).";
      }
    }

    return { question, answer, options, hint };
  }
};

// Make it available on window object
if (typeof window !== 'undefined') {
  window.QuestionsGenerator = QuestionsGenerator;
}
