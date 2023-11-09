import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Linking, StyleSheet } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useNavigate } from "react-router-native";

const QRCodeScanner = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    navigate(`ObjectDetection?url=${data}`);
  };

  const handleUrlSubmit = () => {
    if (manualUrl.trim() !== '') {
      navigate(`ObjectDetection?url=${manualUrl}`);
    }
  };

  if (hasPermission === null) {
    return <Text style={styles.text}>Requesting camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text style={styles.text}>No access to camera</Text>;
  }

  const handleExternalLink = () => {
    Linking.openURL('https://colab.research.google.com/drive/1O73d1UrJUSuSvhT2cUfPgGFTvk3A6-im?usp=sharing');
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter URL manually"
        placeholderTextColor="gray"
        onChangeText={(text) => setManualUrl(text)}
        onSubmitEditing={handleUrlSubmit}
        value={manualUrl}
      />
      <View style={styles.cameraContainer}>
        <View style={styles.square}>
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={{ flex: 1 }}
          />
        </View>
      </View>
      <Text style={styles.text}>Scan Your object detection QR code. You can get a QR code by clicking&nbsp;
        <TouchableOpacity onPress={handleExternalLink}>
          <Text style={styles.linkText}>here</Text>
        </TouchableOpacity>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  linkText: {
    color: 'blue',
    textDecorationLine: 'underline',
    fontSize: 24,
  },
  cameraContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    aspectRatio: 1,
  },
  square: {
    width: '80%',
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: 'white',
    overflow: 'hidden',
  },
  input: {
    marginTop: "20%",
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    color: 'white',
    margin: 20,
    paddingHorizontal: 10,
  },
});

export default QRCodeScanner;
