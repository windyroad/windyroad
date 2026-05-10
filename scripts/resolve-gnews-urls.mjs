import { chromium } from 'playwright';

const urls = [
  ["nyt-whitehouse-vetting", "https://news.google.com/rss/articles/CBMidEFVX3lxTE95MUd1NzV6M0VweHpKbTM1YXdmemJQUnBKVEp6LU1kb3NLMEZnUEhQTWoxcmo0aDZLN3h6WF9iU3VlemdyT2RtVmlDd1o3M2Y5QjlDYUZ1dzgwWldBVWZtMDFzTHZiRDVDMmZYbXhYa3Zkekkx?oc=5"],
  ["reuters-whitehouse", "https://news.google.com/rss/articles/CBMiugFBVV95cUxPWGlZa1RoakVfZmdhdU9fUnIwcHlvZWxNM09ZM2VEVmJ1Y2tBU0kycVFSMnN3UFFDUmJLUlMxb2Q4alg2dzRlNV9IVi1INTY4VlB4ZlZpczdEOWZyLWtGWmZYNVR1UDlVMGFUamFyUW5oYUpfcU40SVk4R3Zoc3NjbTZ0Tl9GRjU0eVZDZFh5RHJucHpIakFWWklhUE83Vzg5bk9HZFJvV2Y5NWg5NVFMb2c4TmRkNjNjUGc?oc=5"],
  ["wapo-anthropic-whitehouse", "https://news.google.com/rss/articles/CBMiiAFBVV95cUxPZk9iMkZSZEx1YWxvRXFzRm9vYWV4RWRaYlJFWjBYSFF2MHhITy10a0ZfbDNrTnptZDY4UTR6UmJZT2NSanpFSGZsMTJKRUdaRmZyOTVrTTF0Z2lKRXItVXpMNHlaak11aVlZbklIcVkwcWppdWs1T0lyakwxU3VTOFU1b1huWXd1?oc=5"],
  ["politico-vetting", "https://news.google.com/rss/articles/CBMilgFBVV95cUxQM3NOcGR4TkdNTzN1UjVDZ2MzbjVIUHo0NW13bXJTQWZJbUlaRGpoLW9KQWkzYl9CQzFLdUxDX1kzVHZrclJSVGZXTWJPdno0RUVpc0VOSTlvX2RyZzRPZ19FQ1Q3MXNtdnY1SWxzVUVIeXk3T0QwTERJaVl6WTZmOW44Nmd3SHhtRVQwMTBpdW5jTC1ERlE?oc=5"],
  ["axios-mythos", "https://news.google.com/rss/articles/CBMifkFVX3lxTE5CSlRUZEFlU3dPVlJEMjlZSGM0SlNNRHhaMEs0TGZYUTdMUGlfV0V6cWhOT0xqLThjRG9PZ0xfY28xbDQxai1DcVM2cFNHOU01RFAyOWVDd3RHaEt2c19HOFhWRGJkVG94MDhMTGtpMVNaSjlkMGVmbTNENDFRdw?oc=5"],
  ["openai-pwc", "https://news.google.com/rss/articles/CBMiakFVX3lxTE9WM3hMcGhqNXdRUEJ6bUNzRy1ZemJWTThYbHlqTWZ4eXc0elI2aW42U2RWZGlLaF8zWlR4V2JmZTFCUlBOeEFrMmgxNUdMbmNIUFFvbzA3RW9ZNi14eFRjYjRiQ0RrV291cVE?oc=5"],
  ["openai-chatgpt-ads", "https://news.google.com/rss/articles/CBMiY0FVX3lxTE9DakhNTzFRRHp4eFdNQ0xWQ0dNRk13ZjEyNXUtcEowMFNHNk1XTWlTQ3J0Wm82QjdRY3BWdjVjQmxlYkJFWUxoTnR0NFJuZzJmeGR6U0wtWnpoRVVDVHktdDBPWQ?oc=5"],
  ["openai-supercomputer", "https://news.google.com/rss/articles/CBMiZEFVX3lxTE44UjNuSVJqV1FLVFlvR2VfWjZhZmtNMDZjWkREZGpsOEx2UWN6c0JqZGZzZ1JyeV85aVB1Yk56OUhlUTV5bE1sZmVsUk9EaHJEcF9JakVLczQyd0dOMDVTcVdhcTg?oc=5"],
  ["openai-voice-intelligence", "https://news.google.com/rss/articles/CBMiiAFBVV95cUxOZXh4QmdkQndXWExHQmFYbVItTHpPQlIwcEI0QV9nenlYdHN2ZnhFT1NSenBERDZmTHBkV3daSWlvUC1HMllwWXZiZXROaWx2LU0ybk5KVzhqNnZuaEdMTE9IVTB4aEdUdkJyb3pWdHRwY2F4MEg1cE5mVDUySmNtTUFOMUJLLVRM?oc=5"],
  ["verge-xbox", "https://news.google.com/rss/articles/CBMihgFBVV95cUxPdW1jRnJjQmNLUWZINkNzTEVoLWdPcmltdmQ0eW1MNzcxeTZ0d3VpZ093TTJMUlI4c0FNOHYxQkMtRHRUSzhqV2d5NDh3REZkbUJVdEZsUjlLbU01M2xTNHZrMzJSaHd1V3A0enFkUGhIMTl6cUdQMjA1dVF4UHlVbDNkekRiQQ?oc=5"],
  ["pcgamer-xbox", "https://news.google.com/rss/articles/CBMihwJBVV95cUxOb2l4azRWZUY0aU5yOWNiZFNiSTVaSHRRWXdRc1A0elh3cFFtQnBTMmlSZFUyNlNaR2NEa2g4OWxGWEhIa0RZWEplRkJRRXFnWC1sanlTR2xmZTFQbUhmTmVxQjF3cG5NWllIcllRenNXWTBHVlNrbmFFSU5zcXJoRTg4LXVEZmp6MTFqSzhJZXAxOHoydGRqSnAzcnM1Q2tTV0ZhYXpfN2U4Vk1VM3ZNZTdVcVYtMDk2blU2WmxsLUtDRE1DTkc3NV91QkpyTURGWTJpamlwdFlScVVHd1lnNDhFSmNNUUREOC0xVEh4WTJodk1OYnBHczlNYTJCRm5VM1RrZTA4UQ?oc=5"],
  ["engadget-xbox", "https://news.google.com/rss/articles/CBMifEFVX3lxTFBTQ3JhQzZFQlgzbVJTVGhpanNZZk5NbVlhbkFaUm5vQmJXQnloQ3V2TFZKdTl0aDZ6VEViWmZkNS0yanNyWVJiUDJGN2JjaThxdG5PQzFYajIzM29jRTcwWk4xRWs0UUd0OWhlTWN5LXBGWVdGajFsNFBqVzQ?oc=5"],
  ["tomshw-chrome", "https://news.google.com/rss/articles/CBMi1AJBVV95cUxPU2RSQXJOUk5xdjFIRzk2aHRabzhyZElXZUR1c3BZa2g5ZW5JWktOSU5hRmRKVUxmZ0YxWVkxc2JxUE0xMGp0aEJWeHVMUWFDaS1tQk8xQkcxNW84OUxDdHlEUUZwaFAtSjVYYnpHZ09uZEE5X1RhamlxMGF0Nl84SGVOSjhnS0tyMmV5TnFJQWYyT0VFelBKNFJFRFpzVVZjU0J1VF8xSEhpYjIwQzU4RGZRbDEta2lKN25NMUFTUWtDcjY4Y0d6eHhlWno2STRuSkRQVEhSZ2g0cTc3WFREa0NJS1hoUUpPem1kbWMwQ2kzbUVtN19HQXdYSl9QaVdIeVlDaGZ1dzlZdmF1YmlpOU1obFYxaHRSaEs3NGJyNmFtOXp6YlhaZUNkWlNhb2FDSWJjVU9xYktEQmo0SVA1QXo3ZEZFV2lqZGtIOW9YbGFCODFF?oc=5"],
  ["ghacks-chrome", "https://news.google.com/rss/articles/CBMiywFBVV95cUxPNEMxdW11ZFRhUTZQUDlqUEtFZWtWUVVnbUwtT1I4UzRYc243dy1sTFI5a045UFBpQXpKX3lmYkNNMUVZbDFXQmFGc0xabm9UWjVKbjU4OXlwWVhPUWhUZldJWlNuNzlrb2U1OWlJb1ZPRkFTcEtnb09FcmdNSEZxRktRei1sQXZyT2VQVGhiaGFpTlZsa2dFbXp1TThiV0xkc1RZQ19vbzdOb28wRllzWUZSSjQ1aEdURTJyYVM5NXFITlRRM0trN0lEMA?oc=5"],
  ["pcworld-chrome", "https://news.google.com/rss/articles/CBMirAFBVV95cUxPbi1SSEx2Tk5WTkZCMFlBd09DaEVBNi1qbzh3cDZTeTBnSFAwUXpBalNPYW9XdlFVVkU3c0Q3NUUxZml1RmIxMHgtZEkwb2JrSC16NDZQdV9kX2NGRkNQYWZReER4em1fQ3NfbFVDTVJfeERyS09aZTJ4WUwwamFUa3RjYnlpWHlLbm1CMkYxT09UMzBiTUp1ME54VElIazlkM3FFZ2ExYkg5bkFI?oc=5"],
  ["decrypt-chrome", "https://news.google.com/rss/articles/CBMifkFVX3lxTE5uc3FwSXdpSElpaEtBNXZZZWpZcW42VENpU1FwaXhkc053alJjczJrYTByM19NYUhvWlBQd1pGdkJrbjFJb19uSXJXeDZfTklwUXRfNEZrYjh6Q0VEb0NBOXJHVVJ5eUZBYmZ1V2xTVDNnclI0aDJ6NjdRT0NJZ9IBhgFBVV95cUxPYTZIYmpBdUJ0SUdreWdWX2gtZXZrSVE0UHYzRGtFaE5HX1FEbnlxWGVZNm1OQzl5M3hzNGdaMjl4a1BRS3lmNG9jRTF0ejVLVnowVzNEdU0xTGxhZlFKT3p5aEF3MkkxLTZDQnhWMm5EOXBiRTdmTHQwVHJnWGFILXlFcEJRdw?oc=5"],
];

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
});

for (const [label, url] of urls) {
  const page = await context.newPage();
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    // Google News may interpose a meta-refresh / JS redirect; wait briefly for any final navigation
    await page.waitForTimeout(2500);
    let finalUrl = page.url();
    // If still on Google News, look for a meta-refresh or anchor
    if (finalUrl.includes('news.google.com')) {
      const metaRefresh = await page.$eval('meta[http-equiv="refresh" i]', el => el.getAttribute('content')).catch(() => null);
      if (metaRefresh) {
        const match = metaRefresh.match(/url=(.+)/i);
        if (match) finalUrl = match[1].trim();
      } else {
        const linkHref = await page.$eval('a[href*="://"]', el => el.href).catch(() => null);
        if (linkHref && !linkHref.includes('news.google.com')) finalUrl = linkHref;
      }
    }
    console.log(`${label}\t${finalUrl}`);
  } catch (err) {
    console.log(`${label}\tERROR: ${err.message}`);
  }
  await page.close();
}

await browser.close();
