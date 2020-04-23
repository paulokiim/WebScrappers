const {
  CifraClub,
  Cobasi,
  ViajaNet,
  MercadoLivre,
  FlyTap,
  Petz,
} = require("./controllers");
const { userAgent } = require("./config");
const readline = require("./helpers");
const browserUserAgent = userAgent.getUserAgent();
console.log(browserUserAgent);

const handleCrawl = async () => {
  const answer = await readline(
    "> Deseja buscar em qual site?\n> 1- CifraClub\n> 2- Cobasi\n> 3- ViajaNet\n> 4- FlyTap\n> 5- MercadoLivre\n> 6- Petz\n> Input: "
  );
  if (answer === "1") {
    CifraClub(browserUserAgent);
  } else if (answer === "2") {
    Cobasi(browserUserAgent);
  } else if (answer === "3") {
    ViajaNet(browserUserAgent);
  } else if (answer === "4") {
    FlyTap(browserUserAgent);
  } else if (answer === "5") {
    MercadoLivre(browserUserAgent);
  } else if (answer === "6") {
    Petz(browserUserAgent);
  }
};

handleCrawl();
