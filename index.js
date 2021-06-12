console.log(`This program comes with ABSOLUTELY NO WARRANTY;
This is free software, and you are welcome to redistribute it
under certain conditions.`);
async function main() {
var ipAddrs = {};
  const Nimiq = require("/usr/share/nimiq/app/lib/node.js");
  const RateLimit = require('express-rate-limit');
  Nimiq.GenesisConfig.main(); //do this on mainnet
  const express = require("express");const app = express();
  const validationResult = require("express-validator/check").validationResult;
  const sanitizeBody = require("express-validator/filter").sanitizeBody;
  const bodyParser = require("body-parser");
  const http = require("http");
  const Recaptcha = require('express-recaptcha').Recaptcha;
  const Buffer = require("buffer").Buffer;
  const MnemonicPhrase = require("./phrases.js");
  const privateKey = Buffer.from(MnemonicPhrase.mnemonicToKey(require("./privatekey.js")), "hex");
var cloudflare = require('cloudflare-express');
  const key = new Nimiq.PrivateKey(privateKey);
  const keyPair = Nimiq.KeyPair.derive(key);
  const wallet = new Nimiq.Wallet(keyPair);

  const consensus = await Nimiq.Consensus.light();
  consensus.network.connect();
  async function sendTo(address) {
    console.log("!!!!!!!!!!!!!!");
    var transaction = wallet.createTransaction(Nimiq.Address.fromUserFriendlyAddress(address), 4, 1, consensus.blockchain.head.height);
    await consensus.mempool.pushTransaction(transaction);
  }
  consensus.on('established', async () => {
    // code that requires network consensus
    // If you want, you can put your address below, to make it automatically send you some NIM every time the faucet boots,
    // for testing purposes.
    //await sendTo("NQ92 589S 4CN6 U0FX NQRV NHQP TQNV CF1U BVHU");
  });
  //Nimiq.Log.instance.level = 1;
  //console.log("pub key: " + wallet.publicKey.toUserFriendlyAddress());
  //const wallet = Nimiq.Wallet.loadPlain(privateKey);
  app.use(cloudflare.restore());
  app.enable('trust proxy');
  const limiter = new RateLimit({
    windowMs: 7.3*60*1000, // 7.3 minutes
    max: 1, 
    delayMs: 0
  });
  const urlEncodedParser = bodyParser.urlencoded({ extended: false });

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  const recaptcha = new Recaptcha("Recaptcha public api key here!", "Recaptcha secret here!");

  app.post("/", urlEncodedParser, recaptcha.middleware.verify, function (req, res) {
console.log("Attempt from: " + req.cf_ip + " with addr of" + req.body.addr);
    if (!req.body.addr) { return res.end("No address."); }
    if (req.recaptcha.error) {
      return res.end("Please ensure the reCAPTCHA was correctly filled out.");
    }
    try {
      sendTo(req.body.addr);
    } catch (e) {
      return res.end("Bad address, or problem sending.");
    }
    return res.redirect("http://nimiq-faucet.surge.sh/?s")
  });

  app.listen(8080, function () {
    console.log("Started on port 8081!");
  });
}
main();
