import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import fs from "fs";
import path from "path";


// Load the docx file as binary content
const content = fs.readFileSync(
    path.resolve("./inputs", "cv.docx"),
    "binary"
);

const zip = new PizZip(content);
const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
});


const data = JSON.parse(fs.readFileSync("./data/users.json", "utf8"))

data.forEach((item, index) => {
    doc.render({
        adi: item.adi,
        soyadi: item.soyadi,
        cinsiyet: "Erkek",
        dogum_yeri: item.dogum_yeri,
        dogum_tarihi: item.dogum_tarihi,
        basvuru_tarihi: "24.05.2022",
        basvuru_pozisyon: "Bilgisayar Mühendisi",
    });
    const buf = doc.getZip().generate({
        type: "nodebuffer",
        compression: "DEFLATE",
    });
    fs.writeFileSync(path.resolve("./outputs", item.adi + "_" + item.soyadi + ".docx"), buf);
});