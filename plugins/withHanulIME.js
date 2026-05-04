const { withAndroidManifest, withMainApplication, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Expo Config Plugin to inject HanulIME custom keyboard
 */
module.exports = function withHanulIME(config) {
  // 1. AndroidManifest.xml: Add <service> and permissions
  config = withAndroidManifest(config, async (config) => {
    const mainApplication = config.modResults.manifest.application[0];
    
    // Check if service already exists to avoid duplicates
    if (!mainApplication.service) mainApplication.service = [];
    const hasService = mainApplication.service.some(s => s.$['android:name'] === '.HanulIME');
    
    if (!hasService) {
      mainApplication.service.push({
        $: {
          'android:name': '.HanulIME',
          'android:label': '@string/app_name',
          'android:permission': 'android.permission.BIND_INPUT_METHOD',
          'android:exported': 'true'
        },
        'intent-filter': [{
          action: [{ $: { 'android:name': 'android.view.InputMethod' } }]
        }],
        'meta-data': [{
          $: {
            'android:name': 'android.view.im',
            'android:resource': '@xml/method'
          }
        }]
      });
    }
    return config;
  });

  // 2. MainApplication.kt: Register IMEPackage
  config = withMainApplication(config, (config) => {
    let content = config.modResults.contents;
    
    // Add IMEPackage() if not already there
    if (!content.includes('add(IMEPackage())')) {
      content = content.replace(
        /PackageList\(this\)\.packages\.apply \{/,
        'PackageList(this).packages.apply {\n              add(IMEPackage())'
      );
      config.modResults.contents = content;
    }
    return config;
  });

  // 3. Dangerous Mod: Copy files to their native locations
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const packagePath = 'com/hanulkeyboard';
      
      // Target paths
      const ktTarget = path.join(projectRoot, 'android/app/src/main/java', packagePath, 'HanulIME.kt');
      const xmlTargetDir = path.join(projectRoot, 'android/app/src/main/res/xml');
      const xmlTarget = path.join(xmlTargetDir, 'method.xml');
      
      // Source paths
      const ktSource = path.join(projectRoot, 'src/native/HanulIME.kt');
      const xmlSource = path.join(projectRoot, 'src/native/method.xml');

      // Copy HanulIME.kt
      if (fs.existsSync(ktSource)) {
        fs.copyFileSync(ktSource, ktTarget);
      }

      // Copy method.xml
      if (!fs.existsSync(xmlTargetDir)) {
        fs.mkdirSync(xmlTargetDir, { recursive: true });
      }
      if (fs.existsSync(xmlSource)) {
        fs.copyFileSync(xmlSource, xmlTarget);
      }

      return config;
    }
  ]);

  return config;
};
