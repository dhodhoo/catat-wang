import type { ParsedIncomingText, TransactionType, ReviewStatus, CreateIntentPayload } from "@/types/domain";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function parseWithAi(
  text: string,
  receivedAt: Date,
  timezone: string
): Promise<ParsedIncomingText | null> {
  if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY not configured");
    return null;
  }

  const prompt = `
    Anda adalah asisten keuangan pribadi yang sangat pintar.
    Tugas Anda adalah mengekstrak data transaksi keuangan dari chat WhatsApp pengguna.
    Waktu sekarang: ${receivedAt.toISOString()} (Zona waktu: ${timezone})

    Aturan Ekstraksi:
    1. Ekstrak intent pencatatan (intent: "create").
    2. Ekstrak jumlah uang (amount): pahami format seperti "200k", "25rb", "dua ratus ribu", "50k", "setengah juta", dll. Jika jumlah tidak jelas, kembalikan intent "unknown".
    3. Tentukan tipe transaksi ("income" atau "expense").
    4. Tentukan kategori (categoryName) dari daftar: "Makan & Minum", "Transportasi", "Tagihan", "Belanja", "Kesehatan", "Pendidikan", "Gaji", "Bonus", "Lainnya". Pilih yang paling relevan.
    5. Ambil catatan (note): hilangkan bagian nominal dan kata kunci kategori jika memungkinkan agar note bersih.
    6. Tentukan tanggal (transactionDate) dalam format YYYY-MM-DD. Gunakan waktu sekarang sebagai referensi jika chat tidak menyebutkan waktu khusus.
    7. Berikan confidence (reviewStatus): "clear" jika Anda sangat yakin, "need_review" jika Anda ragu atau nominal tidak pasti.

    Format Output (JSON murni):
    {
      "intent": "create",
      "transaction": {
        "type": "income" | "expense",
        "amount": number,
        "transactionDate": "YYYY-MM-DD",
        "categoryName": string,
        "note": string | null,
        "reviewStatus": "clear" | "need_review",
        "reviewReasons": [{ "code": string, "message": string }]
      }
    }

    Jika teks adalah perintah khusus:
    - "hapus" atau "batal" -> { "intent": "delete_last" }
    - "edit" atau "ubah" -> { "intent": "update_last", "patch": { ... } }
    - "link 123456" -> { "intent": "link_account", "code": "123456" }

    Jika teks tidak mengandung data transaksi, balas dengan { "intent": "unknown" }.
  `;

  try {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Teks: "${text}"\n\nPrompt: ${prompt}` }] }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              intent: { type: "STRING" },
              transaction: {
                type: "OBJECT",
                properties: {
                  type: { type: "STRING" },
                  amount: { type: "NUMBER" },
                  transactionDate: { type: "STRING" },
                  categoryName: { type: "STRING" },
                  note: { type: "STRING" },
                  reviewStatus: { type: "STRING" },
                  reviewReasons: {
                    type: "ARRAY",
                    items: {
                      type: "OBJECT",
                      properties: {
                        code: { type: "STRING" },
                        message: { type: "STRING" }
                      }
                    }
                  }
                }
              },
              patch: {
                type: "OBJECT",
                properties: {
                  amount: { type: "NUMBER" },
                  categoryName: { type: "STRING" },
                  transactionDate: { type: "STRING" }
                }
              },
              code: { type: "STRING" }
            }
          }
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      return null;
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) return null;
    return JSON.parse(content) as ParsedIncomingText;
  } catch (error) {
    console.error("AI Parser error:", error);
    return null;
  }
}
