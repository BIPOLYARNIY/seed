(function() {

    // mnemonics is populated as required by getLanguage
    var mnemonics = { "english": new Mnemonic("english") };
    var mnemonic = mnemonics["english"];
    var seed = null;
    var bip32RootKey = null;
    var bip32ExtendedKey = null;
    var network = bitcoinjs.bitcoin.networks.bitcoin;
    var addressRowTemplate = $("#address-row-template");

    var showIndex = true;
    var showAddress = true;
    var showPubKey = true;
    var showPrivKey = true;
    var showQr = false;
    var litecoinUseLtub = true;

    var entropyChangeTimeoutEvent = null;
    var phraseChangeTimeoutEvent = null;
    var rootKeyChangedTimeoutEvent = null;

    var generationProcesses = [];

    var DOM = {};
    DOM.privacyScreenToggle = $(".privacy-screen-toggle");
    DOM.network = $(".network");
    DOM.bip32Client = $("#bip32-client");
    DOM.phraseNetwork = $("#network-phrase");
    DOM.useEntropy = $(".use-entropy");
    DOM.entropyContainer = $(".entropy-container");
    DOM.entropy = $(".entropy");
    DOM.entropyFiltered = DOM.entropyContainer.find(".filtered");
    DOM.entropyType = DOM.entropyContainer.find(".type");
    DOM.entropyCrackTime = DOM.entropyContainer.find(".crack-time");
    DOM.entropyEventCount = DOM.entropyContainer.find(".event-count");
    DOM.entropyBits = DOM.entropyContainer.find(".bits");
    DOM.entropyBitsPerEvent = DOM.entropyContainer.find(".bits-per-event");
    DOM.entropyWordCount = DOM.entropyContainer.find(".word-count");
    DOM.entropyBinary = DOM.entropyContainer.find(".binary");
    DOM.entropyWordIndexes = DOM.entropyContainer.find(".word-indexes");
    DOM.entropyChecksum = DOM.entropyContainer.find(".checksum");
    DOM.entropyMnemonicLength = DOM.entropyContainer.find(".mnemonic-length");
    DOM.entropyWeakEntropyOverrideWarning = DOM.entropyContainer.find(".weak-entropy-override-warning");
    DOM.entropyFilterWarning = DOM.entropyContainer.find(".filter-warning");
    DOM.phrase = $(".phrase");
    DOM.recovered = $(".recovered")
    DOM.addressesRecovered = $(".addresses-recovery")
 
    DOM.passphrase = $(".passphrase");
    DOM.generateContainer = $(".generate-container");
    DOM.generate = $(".generate");
    DOM.seed = $(".seed");
    DOM.rootKey = $(".root-key");
    DOM.litecoinLtubContainer = $(".litecoin-ltub-container");
    DOM.litecoinUseLtub = $(".litecoin-use-ltub");
    DOM.extendedPrivKey = $(".extended-priv-key");
    DOM.extendedPubKey = $(".extended-pub-key");
    DOM.bip32tab = $("#bip32-tab");
    DOM.bip44tab = $("#bip44-tab");
    DOM.bip49tab = $("#bip49-tab");
    DOM.bip84tab = $("#bip84-tab");
    DOM.bip141tab = $("#bip141-tab");
    DOM.bip32panel = $("#bip32");
    DOM.bip44panel = $("#bip44");
    DOM.bip49panel = $("#bip49");
    DOM.bip32path = $("#bip32-path");
    DOM.bip44path = $("#bip44-path");
    DOM.bip44purpose = $("#bip44 .purpose");
    DOM.bip44coin = $("#bip44 .coin");
    DOM.bip44account = $("#bip44 .account");
    DOM.bip44accountXprv = $("#bip44 .account-xprv");
    DOM.bip44accountXpub = $("#bip44 .account-xpub");
    DOM.bip44change = $("#bip44 .change");
    DOM.bip49unavailable = $("#bip49 .unavailable");
    DOM.bip49available = $("#bip49 .available");
    DOM.bip49path = $("#bip49-path");
    DOM.bip49purpose = $("#bip49 .purpose");
    DOM.bip49coin = $("#bip49 .coin");
    DOM.bip49account = $("#bip49 .account");
    DOM.bip49accountXprv = $("#bip49 .account-xprv");
    DOM.bip49accountXpub = $("#bip49 .account-xpub");
    DOM.bip49change = $("#bip49 .change");
    DOM.bip84unavailable = $("#bip84 .unavailable");
    DOM.bip84available = $("#bip84 .available");
    DOM.bip84path = $("#bip84-path");
    DOM.bip84purpose = $("#bip84 .purpose");
    DOM.bip84coin = $("#bip84 .coin");
    DOM.bip84account = $("#bip84 .account");
    DOM.bip84accountXprv = $("#bip84 .account-xprv");
    DOM.bip84accountXpub = $("#bip84 .account-xpub");
    DOM.bip84change = $("#bip84 .change");
    DOM.bip141unavailable = $("#bip141 .unavailable");
    DOM.bip141available = $("#bip141 .available");
    DOM.bip141path = $("#bip141-path");
    DOM.bip141semantics = $(".bip141-semantics");
    DOM.generatedStrength = $(".generate-container .strength");
    DOM.generatedStrengthWarning = $(".generate-container .warning");
    DOM.hardenedAddresses = $(".hardened-addresses");
    DOM.bitcoinCashAddressTypeContainer = $(".bch-addr-type-container");
    DOM.bitcoinCashAddressType = $("[name=bch-addr-type]")
    DOM.useBip38 = $(".use-bip38");
    DOM.bip38Password = $(".bip38-password");
    DOM.addresses = $(".addresses");
    DOM.csvTab = $("#csv-tab a");
    DOM.csv = $(".csv");
    DOM.rowsToAdd = $(".rows-to-add");
    DOM.more = $(".more");
    DOM.moreRowsStartIndex = $(".more-rows-start-index");
    DOM.feedback = $(".feedback");
    DOM.tab = $(".derivation-type a");
    DOM.indexToggle = $(".index-toggle");
    DOM.addressToggle = $(".address-toggle");
    DOM.publicKeyToggle = $(".public-key-toggle");
    DOM.privateKeyToggle = $(".private-key-toggle");
    DOM.languages = $(".languages a");
    DOM.qrContainer = $(".qr-container");
    DOM.qrHider = DOM.qrContainer.find(".qr-hider");
    DOM.qrImage = DOM.qrContainer.find(".qr-image");
    DOM.qrHint = DOM.qrContainer.find(".qr-hint");
    DOM.showQrEls = $("[data-show-qr]");

    function init() {
        // Events

        DOM.phrase.on("input", delayedPhraseChanged);
 
        setQrEvents(DOM.showQrEls);
        hideValidationError();
 
    }

    // Event handlers


    function delayedPhraseChanged() {
        hideValidationError();
        seed = null;
        bip32RootKey = null;
        bip32ExtendedKey = null;
        showPending();
        if (phraseChangeTimeoutEvent != null) {
            clearTimeout(phraseChangeTimeoutEvent);
        }
        phraseChangeTimeoutEvent = setTimeout(phraseChanged, 400);
    }

    function phraseChanged() {
        showPending();
        setMnemonicLanguage();
        // Get the mnemonic phrase
        var phrase = DOM.phrase.val();
        var errorText = findPhraseErrors(phrase);
        if (errorText) {
            showValidationError(errorText);
            return;
        }
        hideValidationError();
        if (phrase.includes("?")){ //missing words options already displayed
            return;
        }
        $('.addresses-recovery tr').remove();
        DerivePublicAddresses(phrase)
     }
 
 
    // Private methods


    function calcBip32RootKeyFromSeed(phrase, passphrase) {
        seed = mnemonic.toSeed(phrase, passphrase);
        bip32RootKey = bitcoinjs.bitcoin.HDNode.fromSeedHex(seed, network);
    }


    function calcBip32ExtendedKey(path) {
        // Check there's a root key to derive from
        if (!bip32RootKey) {
            return bip32RootKey;
        }
        var extendedKey = bip32RootKey;
        // Derive the key from the path
        var pathBits = path.split("/");
        for (var i=0; i<pathBits.length; i++) {
            var bit = pathBits[i];
            var index = parseInt(bit);
            if (isNaN(index)) {
                continue;
            }
            var hardened = bit[bit.length-1] == "'";
            var isPriv = !(extendedKey.isNeutered());
            var invalidDerivationPath = hardened && !isPriv;
            if (invalidDerivationPath) {
                extendedKey = null;
            }
            else if (hardened) {
                extendedKey = extendedKey.deriveHardened(index);
            }
            else {
                extendedKey = extendedKey.derive(index);
            }
        }
        console.log(extendedKey);
        return extendedKey
    }

    function showValidationError(errorText) {
        DOM.feedback
            .text(errorText)
            .show();
    }

    function hideValidationError() {
        DOM.feedback
            .text("")
            .hide();
    }

    function findPhraseErrors(phrase) {
        // Preprocess the words
        phrase = mnemonic.normalizeString(phrase);
        var words = phraseToWordArray(phrase);
        // Detect blank phrase
        if (words.length == 0) {
            return "Blank mnemonic";
        }
        var unknownWordIndex = -1;
        // Check each word
        for (var i=0; i<words.length; i++) {
            var word = words[i];
            if (word.includes("?")){ //unknown word marker
                if(unknownWordIndex != -1){
                    return "Only 1 unkown word is allowed";
                }
                unknownWordIndex = i;
                continue;
                }
            var language = getLanguage();
            if (WORDLISTS[language].indexOf(word) == -1) {
                console.log("Finding closest match to " + word);
                var nearestWord = findNearestWord(word);
				var nextNearestWords = findNextNearestWords(word);
				var nearestWords = findWordsStartEndWithSameLetter(word);
                return word + " not in wordlist, did you mean " + nearestWord + "?" + " Maybe: " + nextNearestWords + "? How about: " +  nearestWords + "If none of them work, just replace it with '?'";
            }
        }
 
        if (unknownWordIndex != -1) {
            wordBruteforce(words, unknownWordIndex);
            return false;
        }
        // Check the words are valid
        var properPhrase = wordArrayToPhrase(words);
 
        var isValid = mnemonic.check(properPhrase);
        if (!isValid) {
            return "Invalid mnemonic";
        }
        return false;
    }

    function wordBruteforce(words, index)
    {
        var language = getLanguage();
        $('.addresses-recovery tr').remove();
        for (var i = 0; i < WORDLISTS[language].length; i++){
            words[index] = (WORDLISTS[language])[i]; //bruteforce word[index]
 
            phrase = mnemonic.joinWords(words);
            isValid = mnemonic.check(phrase);
            if (isValid) {
                console.log(words[index]);
                console.log(phrase);
                DerivePublicAddresses(phrase, words[index]);
            }

        }
 /* check addresses balance with API
  var ethAddr=[]
 
 //Iterate all td's in column 4
 $('.addresses-recovery tr').each( function(){
                                              //add item to array
                                              ethAddr.push( $('td', this).eq(4).text().trimLeft().trimRight()); //remove white spaces
                                              });
 var btcAddr=[]
 
 //Iterate all td's in columns 1-3
 for (var i = 1; i < 4; i++){
    $('.addresses-recovery tr').each( function(){
                                  //add item to array
                                  btcAddr.push( $('td', this).eq(i).text().trimLeft().trimRight()); //remove white spaces
                                  });
 }

 console.log(ethAddr);
 console.log(btcAddr);
 for (var i = 0; i < ethAddr.length; i++){
 $.get('https://api.ethplorer.io/getAddressInfo/' + ethAddr[i] +'?apiKey=freekey')
 .then(function(d) {
       console.log(d);
       if (d.countTxs > 1){
       console.log("success!");
       }
       });
    }*/
 }
function DerivePublicAddresses(phrase, word = "(no missing word)")
 {
     calcBip32RootKeyFromSeed(phrase, '');
     console.log(bip32RootKey.toBase58());
 
     var path44 = "m/44'/0'/0'/0";
     var address44 = DerivePublicAddress(path44)
     var path49 = "m/49'/0'/0'/0";
     var address49 = DerivePublicAddress(path49)
     var path84 = "m/84'/0'/0'/0";
     var address84 = DerivePublicAddress(path84)
     var pathEth = "m/44'/60'/0'/0";
     var addressEth = DerivePublicAddress(pathEth)
     var pathEth32 = "m/44'/60'/0'";
     var addressEth32 = DerivePublicAddress(pathEth32)
     var pathXRP = "m/44'/144'/0'/0";
     var addressXRP = DerivePublicAddress(pathXRP)
	 var pathLTC = "m/44'/2'/0'/0";
     var addressLTC = DerivePublicAddress(pathLTC)
	 var pathZEN = "m/44'/121'/0'/0";
     var addressZEN = DerivePublicAddress(pathZEN)
 
 
        var html = '';
         html = '<tr><td>' + word +
         '&nbsp</td><td>&nbsp' + createAddressUrl(address44,'btc') +  
		 '&nbsp</td><td>&nbsp' + createAddressUrl(address49,'btc') + 
		 '&nbsp</td><td>&nbsp' + createAddressUrl(address84,'btc') + 
		 '&nbsp</td><td>&nbsp' + createAddressUrl(addressEth, 'eth') +  
		 '&nbsp</td><td>&nbsp' + createAddressUrl(addressEth32,'eth') + 
		 '&nbsp</td><td>&nbsp' + createAddressUrl(addressXRP,'nolink') + 
		 '&nbsp</td><td>&nbsp' + createAddressUrl(addressLTC,'ltc') + 		
		 '&nbsp</td><td>&nbsp' + createAddressUrl(addressZEN,'zen') + 		 
		 '&nbsp</td></tr>';
 
 DOM.addressesRecovered.append(html);
 

 }
 
 function createAddressUrl(address, coinType)
 {
	if(coinType == 'nolink') {
		str = address;
	}
	
	if(coinType == 'zen') {
		str = '<a href="https://explorer.zensystem.io/address/' + address + '" target=”_blank">' + address + '</a>';
		
	}
	
	if(coinType == 'ltc') {
		str = '<a href="https://live.blockcypher.com/ltc/address/' + address + '" target=”_blank">' + address + '</a>';
	}
		
	if(coinType == 'btc' || coinType == 'eth') {
		str = '<a href="https://www.blockchain.com/' + coinType + '/address/' + address + '" target=”_blank">' + address + '</a>';
    }
	
	return str;
 }
 
 
 function DerivePublicAddress(path) { //based on calculateValues

    bip_ver = parseInt((path.split("/")[1]).replace("'",""));
    coin = parseInt((path.split("/")[2]).replace("'",""));
    console.log(bip_ver)
            var key = derive(path)
 
            var keyPair = key.keyPair;
			
			//Add more robust processing to support different coin types supportd by bitcoinjs
			//only considering uncompresesd keys
			
			if (coin == 2) { //Litecoin
			keyPair = new bitcoinjs.bitcoin.ECPair(keyPair.d, null, {network: bitcoinjs.bitcoin.networks.litecoin});
			}
			
			if (coin == 121) { //Zencash
			keyPair = new bitcoinjs.bitcoin.ECPair(keyPair.d, null, {network: bitcoinjs.bitcoin.networks.zencash});
			}
					
            // get address
            var address = keyPair.getAddress().toString();

            // Ethereum values are different

            if (coin == 60) // ETH
            {
            var privKeyBuffer = keyPair.d.toBuffer(32);
            privkey = privKeyBuffer.toString('hex');
            var addressBuffer = ethUtil.privateToAddress(privKeyBuffer);
            var hexAddress = addressBuffer.toString('hex');
            var checksumAddress = ethUtil.toChecksumAddress(hexAddress);
            return address = ethUtil.addHexPrefix(checksumAddress);
            }
 
            // BTC Segwit addresses are different
            if ((bip_ver == 141) || (bip_ver == 84))   {
            var keyhash = bitcoinjs.bitcoin.crypto.hash160(key.getPublicKeyBuffer());
            var scriptpubkey = bitcoinjs.bitcoin.script.witnessPubKeyHash.output.encode(keyhash);
            address = bitcoinjs.bitcoin.address.fromOutputScript(scriptpubkey, network)
            }
            if (bip_ver == 49) {
            var keyhash = bitcoinjs.bitcoin.crypto.hash160(key.getPublicKeyBuffer());
            var scriptsig = bitcoinjs.bitcoin.script.witnessPubKeyHash.output.encode(keyhash);
            var addressbytes = bitcoinjs.bitcoin.crypto.hash160(scriptsig);
            var scriptpubkey = bitcoinjs.bitcoin.script.scriptHash.output.encode(addressbytes);
            address = bitcoinjs.bitcoin.address.fromOutputScript(scriptpubkey, network)
            }
			
			// Ripple is different
            if (coin == 144)
            {
				address = convertRippleAdrr(address);
            }
			
 return address;
 }

	//Super cut-down version of derive
    function derive(path)
     {
        var bip32ExtendedKey = calcBip32ExtendedKey(path);
				
		//Return non-hardened key 0
        var key = bip32ExtendedKey.derive(0); 
 
        return key;
     }


	 //TODO REMOVE FROM IAN COLEMAN TOOL
	 function calcForDerivationPath() {
        clearDerivedKeys();
        clearAddressesList();
        showPending();
        // Don't show segwit if it's selected but network doesn't support it
        if (segwitSelected() && !networkHasSegwit()) {
            showSegwitUnavailable();
            hidePending();
            return;
        }
        showSegwitAvailable();
        // Get the derivation path
        var derivationPath = getDerivationPath();
        var errorText = findDerivationPathErrors(derivationPath);
        if (errorText) {
            showValidationError(errorText);
            return;
        }
        bip32ExtendedKey = calcBip32ExtendedKey(derivationPath);
        if (bip44TabSelected()) {
            displayBip44Info();
        }
        else if (bip49TabSelected()) {
            displayBip49Info();
        }
        else if (bip84TabSelected()) {
            displayBip84Info();
        }
        displayBip32Info();
    }
	//TODO REMOVE FROM IAN COLEMAN TOOL



    function showPending() {
        DOM.feedback
            .text("Calculating... This can take upto a minute with an i5 @ 3Ghz, so be patient :)")
            .show();
    }

	//Original Function to find single closest word
    function findNearestWord(word) {
        var language = getLanguage();
        var words = WORDLISTS[language];
        var minDistance = 99;
        var closestWord = words[0];
        for (var i=0; i<words.length; i++) {
            var comparedTo = words[i];
            if (comparedTo.indexOf(word) == 0) {
                return comparedTo;
            }
            var distance = Levenshtein.get(word, comparedTo);
            if (distance < minDistance) {
                closestWord = comparedTo;
                minDistance = distance;
            }
        }
        return closestWord;
    }
	
	//Extend this function to find the next 3 nearest words
	function findNextNearestWords(word) {
        var language = getLanguage();
        var words = WORDLISTS[language];
        var minDistance = 99;
		var closestWordMinus1 = '';
		var closestWordMinus2 = '';
	
        var closestWord = words[0];
        for (var i=0; i<words.length; i++) {
            var comparedTo = words[i];
            if (comparedTo.indexOf(word) == 0) {
                return comparedTo;
            }
            var distance = Levenshtein.get(word, comparedTo);
            if (distance < minDistance) {
				closestWordMinus2 = closestWordMinus1;
				closestWordMinus1 = closestWord;
                closestWord = comparedTo;
                minDistance = distance;
            }
        }
        return closestWordMinus1 + ", " + closestWordMinus2;
    }
	
	//Iterate through a the wordlist and show words that start and end with the same letter (Theory being that people may be more liekly to get the first/last letters right, and suggestions from "nearest" can be unhelpful)
	function findWordsStartEndWithSameLetter(word) {
		var language = getLanguage();
        var words = WORDLISTS[language];
		var closeWords = '';
		for (var i=0; i<words.length; i++) {
            var comparedTo = words[i];
            if (comparedTo[0] == word[0]) {
				if (comparedTo[comparedTo.length-1] == word[word.length-1]) {
					closeWords = closeWords + comparedTo + ", "
				}
            }
        }
		return closeWords;
	}

    function hidePending() {
        DOM.feedback
            .text("")
            .hide();
    }



    function getLanguage() {
        var defaultLanguage = "english";
        // Try to get from existing phrase
        var language = getLanguageFromPhrase();
        // Try to get from url if not from phrase
        if (language.length == 0) {
            language = getLanguageFromUrl();
        }
        // Default to English if no other option
        if (language.length == 0) {
            language = defaultLanguage;
        }
        return language;
    }

    function getLanguageFromPhrase(phrase) {
        // Check if how many words from existing phrase match a language.
        var language = "";
        if (!phrase) {
            phrase = DOM.phrase.val();
        }
        if (phrase.length > 0) {
            var words = phraseToWordArray(phrase);
            var languageMatches = {};
            for (l in WORDLISTS) {
                // Track how many words match in this language
                languageMatches[l] = 0;
                for (var i=0; i<words.length; i++) {
                    var wordInLanguage = WORDLISTS[l].indexOf(words[i]) > -1;
                    if (wordInLanguage) {
                        languageMatches[l]++;
                    }
                }
                // Find languages with most word matches.
                // This is made difficult due to commonalities between Chinese
                // simplified vs traditional.
                var mostMatches = 0;
                var mostMatchedLanguages = [];
                for (var l in languageMatches) {
                    var numMatches = languageMatches[l];
                    if (numMatches > mostMatches) {
                        mostMatches = numMatches;
                        mostMatchedLanguages = [l];
                    }
                    else if (numMatches == mostMatches) {
                        mostMatchedLanguages.push(l);
                    }
                }
            }
            if (mostMatchedLanguages.length > 0) {
                // Use first language and warn if multiple detected
                language = mostMatchedLanguages[0];
                if (mostMatchedLanguages.length > 1) {
                    console.warn("Multiple possible languages");
                    console.warn(mostMatchedLanguages);
                }
            }
        }
        return language;
    }

    function getLanguageFromUrl() {
        for (var language in WORDLISTS) {
            if (window.location.hash.indexOf(language) > -1) {
                return language;
            }
        }
        return "";
    }

    function setMnemonicLanguage() {
        var language = getLanguage();
        // Load the bip39 mnemonic generator for this language if required
        if (!(language in mnemonics)) {
            mnemonics[language] = new Mnemonic(language);
        }
        mnemonic = mnemonics[language];
    }

    function convertPhraseToNewLanguage() {
        var oldLanguage = getLanguageFromPhrase();
        var newLanguage = getLanguageFromUrl();
        var oldPhrase = DOM.phrase.val();
        var oldWords = phraseToWordArray(oldPhrase);
        var newWords = [];
        for (var i=0; i<oldWords.length; i++) {
            var oldWord = oldWords[i];
            var index = WORDLISTS[oldLanguage].indexOf(oldWord);
            var newWord = WORDLISTS[newLanguage][index];
            newWords.push(newWord);
        }
        newPhrase = wordArrayToPhrase(newWords);
        return newPhrase;
    }

    // TODO look at jsbip39 - mnemonic.splitWords
    function phraseToWordArray(phrase) {
        var words = phrase.split(/\s/g);
        var noBlanks = [];
        for (var i=0; i<words.length; i++) {
            var word = words[i];
            if (word.length > 0) {
                noBlanks.push(word);
            }
        }
        return noBlanks;
    }

    // TODO look at jsbip39 - mnemonic.joinWords
    function wordArrayToPhrase(words) {
        var phrase = words.join(" ");
        var language = getLanguageFromPhrase(phrase);
        if (language == "japanese") {
            phrase = words.join("\u3000");
        }
        return phrase;
    }





    function setQrEvents(els) {
        els.on("mouseenter", createQr);
        els.on("mouseleave", destroyQr);
        els.on("click", toggleQr);
    }

    function createQr(e) {
        var content = e.target.textContent || e.target.value;
        if (content) {
            var qrEl = kjua({
                text: content,
                render: "canvas",
                size: 310,
                ecLevel: 'H',
            });
            DOM.qrImage.append(qrEl);
            if (!showQr) {
                DOM.qrHider.addClass("hidden");
            }
            else {
                DOM.qrHider.removeClass("hidden");
            }
            DOM.qrContainer.removeClass("hidden");
        }
    }

    function destroyQr() {
        DOM.qrImage.text("");
        DOM.qrContainer.addClass("hidden");
    }

    function toggleQr() {
        showQr = !showQr;
        DOM.qrHider.toggleClass("hidden");
        DOM.qrHint.toggleClass("hidden");
    }






    function uint8ArrayToHex(a) {
        var s = ""
        for (var i=0; i<a.length; i++) {
            var h = a[i].toString(16);
            while (h.length < 2) {
                h = "0" + h;
            }
            s = s + h;
        }
        return s;
    }

 





    function addSpacesEveryElevenBits(binaryStr) {
        return binaryStr.match(/.{1,11}/g).join(" ");
    }




    init();

})();
