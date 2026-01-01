<script lang="ts">
  import { Html5QrcodeScanner } from "html5-qrcode";
  import QRCode from 'qrcode';
  import { onDestroy, onMount } from 'svelte';

  let url = '';
  let status = '';
  let isWriting = false;
  let isReading = false;
  let nfcSupported = false;
  let readRecords: any[] = [];
  let showScanner = false;
  let scanner: Html5QrcodeScanner | null = null;
  let generatedQrCodeUrl = '';

  onMount(() => {
    if ('NDEFReader' in window) {
      nfcSupported = true;
    } else {
      status = 'Web NFC is not supported on this device/browser.';
    }
  });

  onDestroy(() => {
    if (scanner) {
        try { scanner.clear(); } catch(e) {}
    }
  });

  function onScanSuccess(decodedText: string, decodedResult: any) {
    url = decodedText;
    toggleScanner();
  }

  function toggleScanner() {
    if (showScanner) {
      showScanner = false;
      if (scanner) {
        try { scanner.clear(); } catch(e) {}
        scanner = null;
      }
    } else {
      showScanner = true;
      setTimeout(() => {
        if (!showScanner) return;
        scanner = new Html5QrcodeScanner(
          "reader",
          { fps: 10, qrbox: { width: 250, height: 250 } },
          /* verbose= */ false
        );
        scanner.render(onScanSuccess, (error) => {
            // ignore errors
        });
      }, 100);
    }
  }

  async function writeNfc() {
    if (!nfcSupported) return;
    if (!url) {
      status = 'Please enter a URL first.';
      return;
    }

    isWriting = true;
    status = 'Approach an NFC tag to write...';

    try {
      const ndef = new (window as any).NDEFReader();

      const alipayUrl = `https://render.alipay.com/p/s/ulink/sn?s=dc&scheme=alipay%3A%2F%2Fnfc%2Fapp%3Fid%3D10000007%26actionType%3Droute%26codeContent%3D${encodeURIComponent(encodeURIComponent(url))}`;

      const records = [
        {
          recordType: "url",
          data: alipayUrl
        },
        {
          recordType: "android.com:pkg",
          data: new TextEncoder().encode("com.eg.android.AlipayGphone")
        }
      ];

      await ndef.write({ records });
      status = 'Successfully written to NFC tag!';
    } catch (error: any) {
      status = `Write failed: ${error.message}`;
    } finally {
      isWriting = false;
    }
  }

  async function readNfc() {
    if (!nfcSupported) return;

    isReading = true;
    status = 'Approach an NFC tag to read...';
    readRecords = [];

    try {
      const ndef = new (window as any).NDEFReader();
      await ndef.scan();

      ndef.onreading = async (event: any) => {
        const decoder = new TextDecoder();
        const records = event.message.records;

        readRecords = records.map((record: any) => {
          let data = '';
          let extractedUrl = '';

          if (record.recordType === 'url') {
             data = decoder.decode(record.data);
             try {
                const urlObj = new URL(data);
                if (urlObj.hostname === 'render.alipay.com') {
                   const scheme = urlObj.searchParams.get('scheme');
                   if (scheme) {
                      const schemeObj = new URL(scheme);
                      const codeContent = schemeObj.searchParams.get('codeContent');
                      if (codeContent) {
                         extractedUrl = codeContent;
                      }
                   }
                }
             } catch (e) {
                console.error('Error parsing Alipay URL:', e);
             }
          } else if (record.recordType === 'text') {
             data = decoder.decode(record.data);
          } else if (record.recordType === 'android.com:pkg') {
             data = decoder.decode(record.data);
          } else {
             // Try generic decoding for other types
             try {
                data = decoder.decode(record.data);
             } catch (e) {
                data = `(Binary data: ${record.data.byteLength} bytes)`;
             }
          }

          return {
            recordType: record.recordType,
            mediaType: record.mediaType,
            id: record.id,
            data: data,
            extractedUrl: extractedUrl
          };
        });

        const firstExtracted = readRecords.find(r => r.extractedUrl);
        if (firstExtracted) {
            try {
                generatedQrCodeUrl = await QRCode.toDataURL(firstExtracted.extractedUrl);
            } catch (err) {
                console.error(err);
            }
        } else {
            generatedQrCodeUrl = '';
        }

        status = `Read ${records.length} records from NFC tag.`;
        isReading = false; // Stop "reading" state after first successful read for UI feedback
      };

      ndef.onreadingerror = () => {
        status = "Cannot read data from the NFC tag. Try another one?";
      };

    } catch (error: any) {
      status = `Read failed: ${error.message}`;
      isReading = false;
    }
  }
</script>

<div class="max-w-4xl mx-auto">
  <!-- Title -->
  <div class="text-center mb-6">
    <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-2">
      支付宝碰一下标签工具
    </h1>
  </div>

  <!-- Main Card -->
  <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 dark:border-gray-700/20 p-6 mb-6">

    {#if !nfcSupported}
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
        <strong class="font-bold">Error:</strong>
        <span class="block sm:inline">当前浏览器不支持 Web NFC</span>
      </div>
    {/if}

    <!-- Input Section -->
    <div class="mb-6">
      <label for="urlInput" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        URL
      </label>
      <div class="flex gap-2">
        <input
          id="urlInput"
          type="text"
          bind:value={url}
          placeholder="https://example.com"
          class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          on:click={toggleScanner}
          class="px-4 py-2 bg-gray-200 dark:bg-gray-600 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg transition-colors"
        >
          扫码
        </button>
      </div>

      {#if showScanner}
        <div id="reader" class="mt-4 w-full"></div>
      {/if}
    </div>

    <!-- Actions -->
    <div class="flex flex-col sm:flex-row gap-4 justify-center mb-6">
      <button
        on:click={writeNfc}
        disabled={!nfcSupported || isWriting || isReading}
        class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg shadow transition-colors flex items-center justify-center gap-2"
      >
        {#if isWriting}
          写入中...
        {:else}
          写入
        {/if}
      </button>

      <button
        on:click={readNfc}
        disabled={!nfcSupported || isWriting || isReading}
        class="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg shadow transition-colors flex items-center justify-center gap-2"
      >
        {#if isReading}
          请靠近 NFC 标签
        {:else}
          读取
        {/if}
      </button>
    </div>

    <!-- Status Display -->
    {#if status}
      <div class="p-4 rounded-lg bg-gray-100 dark:bg-gray-700/50 text-center">
        <p class="text-gray-800 dark:text-gray-200 font-medium">{status}</p>
      </div>
    {/if}

    <!-- Read Results -->
    {#if readRecords.length > 0}
      <div class="mt-6">
        <h3 class="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3">标签数据</h3>
        <div class="space-y-3">
          {#each readRecords as record, i}
            <div class="p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/30">
              <div class="flex justify-between items-start mb-1">
                <span class="text-xs font-mono bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded text-gray-700 dark:text-gray-300">
                  Record #{i + 1}
                </span>
                <span class="text-xs text-gray-500 dark:text-gray-400">{record.recordType}</span>
              </div>
              <div class="break-all text-sm text-gray-800 dark:text-gray-200 font-mono mt-2">
                {#if record.extractedUrl}
                  <div class="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                    <span class="block text-xs text-gray-500 mb-1">实际 URL</span>
                    <a href={record.extractedUrl} target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline break-all">
                      {record.extractedUrl}
                    </a>
                    {#if generatedQrCodeUrl && i === readRecords.findIndex(r => r.extractedUrl)}
                        <div class="mt-2">
                            <img src={generatedQrCodeUrl} alt="QR Code" class="w-32 h-32" />
                        </div>
                    {/if}
                  </div>
                {/if}
                {record.data}
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

  </div>
</div>
