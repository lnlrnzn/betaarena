// Airtable Script für Trenchmark AI - Direkt zu Supabase
// Verwendung: Für Tweets/Contracts Tabelle

// Supabase Konfiguration
const SUPABASE_URL = "https://okgszzbqnpparaoclkpc.supabase.co";
const SUPABASE_ANON_KEY = "DEIN_SUPABASE_ANON_KEY_HIER"; // TODO: Ersetzen!

try {
    let input_config = await input.config();
    const record_id = input_config.tweet_id;

    if (!record_id) {
        output.set('status', 'error');
        output.set('message', 'No tweet_id found');
        return;
    }

    // Tweets Tabelle abrufen (passe Tabellennamen an!)
    const table = base.getTable("Feed");
    let record = await table.selectRecordAsync(record_id);

    if (!record) {
        output.set('status', 'error');
        output.set('message', 'Record not found');
        return;
    }

    // Feldwerte aus Airtable lesen
    const tweetId = record.getCellValue("TweetID");
    const username = record.getCellValue("Username") || "unknown";
    const tweetText = record.getCellValue("TweetContent") || "";
    const tokenAddress = record.getCellValue("Contract");
    const tweetUrl = record.getCellValue("TweetURL") || "";
    const submittedAt = record.getCellValue("TweetTime") || new Date().toISOString();

    // Supabase Payload für tweets Tabelle
    const payload = {
        tweet_id: tweetId,
        username: username,
        tweet_text: tweetText,
        token_address: tokenAddress,
        tweet_url: tweetUrl,
        submitted_at: submittedAt,
        airtable_record_id: record_id
    };

    // Direkt an Supabase senden
    let resp = await fetch(SUPABASE_URL + "/rest/v1/tweets", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": "Bearer " + SUPABASE_ANON_KEY,
            "Prefer": "return=minimal"
        },
        body: JSON.stringify(payload)
    });

    output.set('status', resp.status);

    if (resp.ok || resp.status === 201) {
        output.set('message', 'Success - Tweet sent to Supabase');
    } else {
        let responseText = await resp.text();
        output.set('message', 'Error: ' + resp.status);
        output.set('response', responseText);
    }

} catch (error) {
    output.set('status', 'error');
    output.set('message', error.message);
}

// =================================================================
// SETUP ANLEITUNG:
// =================================================================
//
// 1. SUPABASE_ANON_KEY einfügen (Zeile 6):
//    - Gehe zu Supabase Dashboard → Project Settings → API
//    - Kopiere den "anon public" Key
//
// 2. In Airtable Automation erstellen:
//    - Trigger: "When record matches conditions" (z.B. ContractStatus = true)
//    - Action: "Run a script"
//    - Dieses Script einfügen
//
// 3. Input Variables konfigurieren:
//    - tweet_id: {Trigger Record ID}
//
// 4. Feldnamen in Airtable "Feed" Tabelle:
//    - TweetID → tweet_id (required)
//    - Username → username (required)
//    - TweetContent → tweet_text
//    - Contract → token_address (required)
//    - TweetURL → tweet_url
//    - TweetTime → submitted_at
//
// 5. Testen:
//    - Erstelle einen Test-Record in Airtable Feed Tabelle
//    - Fülle mindestens aus: TweetID, Username, Contract
//    - Löse Automation aus
//    - Prüfe Automation Run Log in Airtable
//    - Prüfe Supabase tweets Tabelle (sollte neuen Eintrag haben)
//
// =================================================================
