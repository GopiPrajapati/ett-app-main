import React, {useCallback, useEffect, useState} from 'react';
import {
  Alert,
  Image,
  Linking,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';
import images from '../../assets/images';
import {fontPixel, normalize} from '../../commonutils/dimensionutils';
import {commonColors} from '../../commonutils/theme';
import {fontStyles} from '../../commonutils/typography';
import Toast from '../../components/Toast';

const QRScannerModal = React.forwardRef(({onScanSuccess}, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  const {hasPermission, requestPermission} = useCameraPermission();
  const device = useCameraDevice('back');

  const showPermissionAlert = () => {
    Alert.alert(
      'Camera Permission Required',
      'Please allow camera access to scan QR codes. You can enable it in app settings.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Settings',
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            } else {
              Linking.openSettings();
            }
          },
        },
      ],
    );
  };

  // Initialize camera permissions
  useEffect(() => {
    const initializeCamera = async () => {
      try {
        if (!hasPermission) {
          const granted = await requestPermission();
          if (!granted) {
            Toast.show({
              message: 'Camera permission is required to scan QR codes',
              type: 'error',
            });
            close();
          }
        }
      } catch (error) {
        console.error('Permission error:', error);
        Toast.show({
          message: 'Unable to access camera',
          type: 'error',
        });
        close();
      }
    };

    if (isVisible) {
      initializeCamera();
    }
  }, [isVisible, hasPermission, requestPermission]);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: codes => {
      console.log('QR Code detected:', {
        codes,
        rawData: codes[0]?.value,
        type: codes[0]?.type,
        timestamp: new Date().toISOString(),
      });

      if (codes[0]?.value) {
        onScanSuccess(codes[0].value);
        close();
      }
    },
  });

  const open = useCallback(() => {
    console.log('Opening QR Scanner, permission status:', hasPermission);
    if (!hasPermission) {
      requestPermission().then(granted => {
        if (granted) {
          setIsVisible(true);
        } else {
          showPermissionAlert();
        }
      });
    } else {
      setIsVisible(true);
    }
  }, [hasPermission, requestPermission]);

  const close = useCallback(() => {
    console.log('Closing QR Scanner');
    setIsVisible(false);
    // Add any cleanup if needed
  }, []);

  React.useImperativeHandle(ref, () => ({
    open,
    close,
  }));

  console.log('Render - hasPermission:', hasPermission, 'device:', device?.id);

  if (!hasPermission) {
    return null;
  }

  return (
    <Modal
      visible={isVisible}
      transparent={false}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={close}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        {device ? (
          <Camera
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={isVisible && hasPermission}
            codeScanner={codeScanner}
            enableZoomGesture={false}
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.loadingContainer]}>
            <Text style={styles.loadingText}>
              {hasPermission
                ? 'Initializing camera...'
                : 'Camera permission required'}
            </Text>
          </View>
        )}
        <View style={styles.maskOverlay}>
          <View style={styles.topMask} />
          <View style={styles.centerRow}>
            <View style={styles.sideMask} />
            <View style={styles.scanWindow}>
              <View style={styles.cornerTL} />
              <View style={styles.cornerTR} />
              <View style={styles.cornerBL} />
              <View style={styles.cornerBR} />
            </View>
            <View style={styles.sideMask} />
          </View>
          <View style={styles.bottomMask}>
            <Text style={styles.instructionText}>
              Align QR code within the frame to scan
            </Text>
          </View>
        </View>
        <View style={styles.bottomContainer}>
          <Text style={styles.instructionText}>
            Align QR code within the frame to scan
          </Text>
          <TouchableOpacity style={styles.closeButtonBottom} onPress={close}>
            <Text style={styles.closeText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  maskOverlay: {
    flex: 1,
  },
  topMask: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  centerRow: {
    flexDirection: 'row',
    height: normalize(250),
  },
  sideMask: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  bottomMask: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
    paddingTop: normalize(30),
  },
  scanWindow: {
    width: normalize(250),
    height: normalize(250),
    borderWidth: 0,
    position: 'relative',
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: normalize(30),
    height: normalize(30),
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: commonColors.white,
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: normalize(30),
    height: normalize(30),
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: commonColors.white,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: normalize(30),
    height: normalize(30),
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: commonColors.white,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: normalize(30),
    height: normalize(30),
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: commonColors.white,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: normalize(30),
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  closeButtonBottom: {
    marginTop: normalize(20),
    padding: normalize(10),
  },
  closeText: {
    ...fontStyles.archivoMedium,
    fontSize: fontPixel(16),
    color: commonColors.white,
  },
  instructionText: {
    ...fontStyles.archivoRegular,
    fontSize: fontPixel(14),
    color: commonColors.white,
    textAlign: 'center',
  },
});

export default QRScannerModal;
