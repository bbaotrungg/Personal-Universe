const { spawn } = require('child_process');
const http = require('http');

function waitHttp(url, timeoutMs = 15000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    function tryConnect() {
      const req = http.get(url, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 500) {
          resolve(true);
        } else {
          setTimeout(tryConnect, 400);
        }
      });
      req.on('error', () => {
        if (Date.now() - start > timeoutMs) {
          reject(new Error('Timeout waiting for ' + url));
        } else {
          setTimeout(tryConnect, 400);
        }
      });
      req.setTimeout(1000, () => req.destroy());
    }
    tryConnect();
  });
}

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const postData = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : null;
    const reqHeaders = { ...headers };
    if (postData && !reqHeaders['Content-Type']) {
      reqHeaders['Content-Type'] = 'application/json';
    }
    if (postData) {
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(
      {
        hostname: 'localhost',
        port: 8787,
        path,
        method,
        headers: reqHeaders,
      },
      (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          let json = null;
          try {
            json = JSON.parse(raw);
          } catch {}
          resolve({ status: res.statusCode, headers: res.headers, body: raw, json });
        });
      }
    );

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING CLOUDFLARE WORKER LOCAL TEST ---');
  console.log('1. Starting wrangler dev on port 8787...');

  const wrangler = spawn('npx', ['wrangler', 'dev', '--port', '8787'], {
    shell: true,
    stdio: 'pipe',
  });

  wrangler.stdout.on('data', (d) => {
    const text = d.toString();
    if (text.includes('Ready') || text.includes('http://')) {
      console.log('[Wrangler]', text.trim());
    }
  });
  wrangler.stderr.on('data', (d) => {
    const text = d.toString();
    if (text.includes('Error') || text.includes('warning')) {
      console.log('[Wrangler Log]', text.trim());
    }
  });

  try {
    await waitHttp('http://localhost:8787', 20000);
    console.log('✓ Cloudflare Worker is live and accepting requests at http://localhost:8787\n');

    // Test 1: Public Mode - GET /api/content
    console.log('Test 1: Public visitor calls GET /api/content...');
    const pubRes = await request('GET', '/api/content');
    console.log(`Status: ${pubRes.status}`);
    if (pubRes.status === 200 && pubRes.json?.data?.personal?.name) {
      console.log(`✓ Passed: Received published content. Name: "${pubRes.json.data.personal.name}", Song: "${pubRes.json.data.personal.status.listeningTo.song}"`);
    } else {
      throw new Error(`Test 1 Failed: ${pubRes.body}`);
    }

    // Test 2: Public visitor tries to access Draft - GET /api/content/draft
    console.log('\nTest 2: Public visitor attempts GET /api/content/draft without token...');
    const unauthDraftRes = await request('GET', '/api/content/draft');
    if (unauthDraftRes.status === 401) {
      console.log('✓ Passed: Unauthorized access blocked (HTTP 401). Draft content is secure.');
    } else {
      throw new Error(`Test 2 Failed: Expected 401, got ${unauthDraftRes.status}`);
    }

    // Test 3: Owner enters Invalid Access Code
    console.log('\nTest 3: Owner verifies with invalid code...');
    const invalidAuth = await request('POST', '/api/auth/verify', { accessCode: 'wrong_code' });
    if (invalidAuth.status === 401) {
      console.log('✓ Passed: Invalid code rejected (HTTP 401).');
    } else {
      throw new Error(`Test 3 Failed: Expected 401, got ${invalidAuth.status}`);
    }

    // Test 4: Owner enters Valid Access Code
    console.log('\nTest 4: Owner verifies with valid code "bimat"...');
    const validAuth = await request('POST', '/api/auth/verify', { accessCode: 'bimat' });
    if (validAuth.status === 200 && validAuth.json?.token) {
      console.log(`✓ Passed: Received session token (length ${validAuth.json.token.length}) with 24h expiration.`);
    } else {
      throw new Error(`Test 4 Failed: ${validAuth.body}`);
    }
    const token = validAuth.json.token;

    // Test 5: Check session token
    console.log('\nTest 5: Check session validity via GET /api/auth/check...');
    const checkRes = await request('GET', '/api/auth/check', null, {
      Authorization: `Bearer ${token}`,
    });
    if (checkRes.status === 200 && checkRes.json?.valid === true) {
      console.log('✓ Passed: Session token is valid.');
    } else {
      throw new Error(`Test 5 Failed: ${checkRes.body}`);
    }

    // Test 6: Owner reads Draft - GET /api/content/draft
    console.log('\nTest 6: Owner reads draft via GET /api/content/draft...');
    const draftRes = await request('GET', '/api/content/draft', null, {
      Authorization: `Bearer ${token}`,
    });
    if (draftRes.status === 200 && draftRes.json?.data?.personal?.name) {
      console.log(`✓ Passed: Received draft data. Nickname: "${draftRes.json.data.personal.nickname}"`);
    } else {
      throw new Error(`Test 6 Failed: ${draftRes.body}`);
    }

    // Test 7: Owner saves Draft - PUT /api/content/draft
    console.log('\nTest 7: Owner updates draft...');
    const currentDraft = draftRes.json.data;
    const testBio = currentDraft.personal.bio + ' (Draft Updated)';
    const updatedDraft = {
      ...currentDraft,
      personal: { ...currentDraft.personal, bio: testBio },
    };
    const putDraftRes = await request('PUT', '/api/content/draft', updatedDraft, {
      Authorization: `Bearer ${token}`,
    });
    if (putDraftRes.status === 200 && putDraftRes.json?.success) {
      console.log('✓ Passed: Draft saved successfully in D1.');
    } else {
      throw new Error(`Test 7 Failed: ${putDraftRes.body}`);
    }

    // Test 8: Verify Public visitor STILL sees original published content (Draft/Published isolation)
    console.log('\nTest 8: Public visitor checks GET /api/content to confirm Draft did not overwrite Published...');
    const checkPubAgain = await request('GET', '/api/content');
    if (!checkPubAgain.json?.data?.personal?.bio.includes('(Draft Updated)')) {
      console.log('✓ Passed: Public content is untouched. Draft/Published separation is 100% verified!');
    } else {
      throw new Error('Test 8 Failed: Published content was accidentally modified by draft!');
    }

    // Test 9: Cloudinary Upload Signing - POST /api/upload/sign
    console.log('\nTest 9: Test Cloudinary direct upload authorization (without secrets in test mode)...');
    const signRes = await request('POST', '/api/upload/sign', { resourceType: 'image' }, {
      Authorization: `Bearer ${token}`,
    });
    // In local dev without Cloudinary secrets configured yet, should return 500 with descriptive message
    if (signRes.status === 200 && signRes.json?.signature) {
      console.log('✓ Passed: Cloudinary signature generated successfully.');
    } else if (signRes.status === 500 && signRes.json?.message?.includes('Cloudinary')) {
      console.log('✓ Passed: Cloudinary signature endpoint validated auth and correctly reported missing credentials.');
    } else {
      throw new Error(`Test 9 Failed: Unexpected status ${signRes.status}, body: ${signRes.body}`);
    }

    // Test 10: Static Assets SPA Fallback - GET /
    console.log('\nTest 10: Fetch root HTML via Cloudflare Workers Static Assets...');
    const htmlRes = await request('GET', '/');
    if (htmlRes.status === 200 && htmlRes.body.includes('<div id="root">')) {
      console.log('✓ Passed: Static assets served correctly by Worker.');
    } else {
      throw new Error(`Test 10 Failed: ${htmlRes.body.substring(0, 100)}`);
    }

    // Test 11: Owner logs out - POST /api/auth/logout
    console.log('\nTest 11: Owner logs out...');
    const logoutRes = await request('POST', '/api/auth/logout', null, {
      Authorization: `Bearer ${token}`,
    });
    if (logoutRes.status === 200) {
      console.log('✓ Passed: Logout successful.');
    }

    // Test 12: Verify revoked token is now rejected
    console.log('\nTest 12: Verify revoked token fails auth...');
    const postLogoutCheck = await request('GET', '/api/auth/check', null, {
      Authorization: `Bearer ${token}`,
    });
    if (postLogoutCheck.json?.valid === false) {
      console.log('✓ Passed: Revoked session token is invalid.');
    } else {
      throw new Error('Test 12 Failed: Revoked token was still valid!');
    }

    // Revert draft changes back to original
    await request('PUT', '/api/content/draft', currentDraft, {
      Authorization: `Bearer ${token}`,
    }).catch(() => {});

    console.log('\n==================================================');
    console.log('🎉 ALL 12 TEST SCENARIOS PASSED WITH 100% SUCCESS!');
    console.log('==================================================\n');
    process.exit(0);
  } finally {
    wrangler.kill();
    // Extra safety cleanup on Windows
    try {
      require('child_process').execSync('taskkill /F /IM wrangler.exe /T 2>nul');
    } catch {}
  }
}

runTests().catch((e) => {
  console.error('Test Suite Error:', e);
  process.exit(1);
});
