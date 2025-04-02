import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Video } from 'expo-av';

// QUAY LẠI NAMED IMPORT DUY NHẤT
import { Camera, VideoQuality } from 'expo-camera';

import { useEffect, useState, useRef } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';

// --- DATA, Stack, Item, HomeScreen, DetailScreen (giữ nguyên) ---
const DATA = [
    { id: '1', title: 'Squat', image: require('./image/squad.png'), description: 'Squats help build strength in your legs.', video: require('./image/squad.mp4'), instructions: 'Stand tall, lower your body by pushing your hips back, thighs parallel to the ground, keep weight on your heels, and rise up while squeezing your glutes.' },
    { id: '2', title: 'Plank', image: require('./image/plank.png'), description: 'Planks are great for core strength.', video: require('./image/plank.mp4'), instructions: "Forearms on the ground, body straight, core tight, don't lift hips too high or drop them low, hold and breathe steadily." },
    { id: '3', title: 'Push ups', image: require('./image/pushups.png'), description: 'Push-ups are a classic upper body exercise.', video: require('./image/pushups.mp4'), instructions: 'Keep your body straight from head to heels, lower your chest to almost touch the floor and then push up' },
];
const Stack = createNativeStackNavigator();

const Item = ({ title, image, onPress }) => (
  <TouchableOpacity style={styles.item} onPress={onPress}>
    <Image source={image} style={styles.image} resizeMode="contain" />
    <Text style={styles.title}>{title}</Text>
  </TouchableOpacity>
);

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Skills</Text>
      <FlatList
        style={styles.list}
        data={DATA}
        renderItem={({ item }) => (
          <Item
            title={item.title}
            image={item.image}
            onPress={() => navigation.navigate('Detail', { item })}
          />
        )}
        keyExtractor={item => item.id}
      />
      <StatusBar style="auto" />
    </View>
  );
};

const DetailScreen = ({ route, navigation }) => {
  const { item } = route.params;
  return (
    <View style={styles.detailContainer}>
      <Video
        source={item.video}
        style={styles.detailVideo}
        resizeMode="contain"
        isLooping
        shouldPlay
        useNativeControls // Add controls for better UX
      />
      <Text style={styles.detailTitle}>{item.title}</Text>
      <Text style={styles.detailDescription}>{item.description}</Text>

      <View style={styles.additionalInfoContainer}>
        <Text style={styles.additionalInfoTitle}>Instructions:</Text>
        <Text style={styles.additionalInfoText}>
          {item.instructions}
        </Text>
      </View>

      <TouchableOpacity style={styles.cameraButton} onPress={() => navigation.navigate('Camera')}>
         {/* Use an icon for the camera button */}
        <Ionicons name="camera-outline" size={24} color="#fff" />
        <Text style={styles.cameraButtonText}> Camera</Text>
      </TouchableOpacity>
    </View>
  );
};


// --- Updated CameraScreen ---
const CameraScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState('back'); // Dùng chuỗi
  const [recording, setRecording] = useState(false);
  const cameraRef = useRef(null);


  // --- Placeholders ---
  const [correctPercentage, setCorrectPercentage] = useState(75);
  const [incorrectPercentage, setIncorrectPercentage] = useState(25);
  const [warningMessage, setWarningMessage] = useState("Keep your back straight!")

  useEffect(() => {
    (async () => {
      try {
        // SỬ DỤNG named export Camera để gọi hàm static
        const cameraPermission = await Camera.requestCameraPermissionsAsync();
        const microphonePermission = await Camera.requestMicrophonePermissionsAsync();
        setHasPermission(
          cameraPermission.status === 'granted' &&
          microphonePermission.status === 'granted'
        );
      } catch (e) {
        console.error("Error requesting permissions:", e);
        setHasPermission(false);
      }
    })();
  }, []);

  const handleCameraSwitch = () => {
    setCameraType(prevType =>
      prevType === 'back' ? 'front' : 'back' // Dùng chuỗi
    );
  };

  const handleTakePicture = async () => {
    if (cameraRef.current && !recording) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
        console.log('Photo URI:', photo.uri);
        alert('Photo Taken!');
      } catch (error) {
        console.error("Failed to take picture:", error);
        alert('Failed to take picture.');
      }
    }
  };

  const handleRecordVideo = async () => {
    if (!cameraRef.current) return;

    if (recording) {
      cameraRef.current.stopRecording();
    } else {
      setRecording(true);
      console.log('Started Recording');
      try {
        // THÊM LẠI QUALITY VỚI VideoQuality
        const video = await cameraRef.current.recordAsync({
          quality: VideoQuality.Video720p // Sử dụng enum import từ thư viện
        });
        console.log('Video URI:', video.uri);
        alert('Video Recorded!');
        // Không setRecording(false) ở đây nếu dùng onRecordingEnd
      } catch (error) {
        console.error("Failed to record video:", error);
        setRecording(false); // Reset khi lỗi
        alert('Failed to record video.');
      }
    }
  };

  const onRecordingEnd = () => {
    console.log("onRecordingEnd called");
    setRecording(false);
 }

 if (hasPermission === null) { return <View style={styles.container}><Text>Requesting permissions...</Text></View>; }
 if (hasPermission === false) { return <View style={styles.container}><Text>No access to camera or microphone.</Text></View>; }

  // --- Render Camera ---
  return (
    <View style={styles.cameraContainer}>
      {/* SỬ DỤNG named export Camera để render */}
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={cameraType} // Dùng state chuỗi
        onRecordingEnd={onRecordingEnd}
        // Có thể thêm các props khác nếu cần (flashMode='off', etc.)
      >
        {/* JSX for overlay and controls */}
        <View style={styles.cameraOverlay}>
            <View style={styles.analysisContainer}>
                <View style={styles.percentageCircleContainer}>
                    <View style={[styles.percentageCircle, styles.correctCircle]}><Text style={styles.percentageText}>{correctPercentage}%</Text><Text style={styles.percentageLabel}>Correct</Text></View>
                    <View style={[styles.percentageCircle, styles.incorrectCircle]}><Text style={styles.percentageText}>{incorrectPercentage}%</Text><Text style={styles.percentageLabel}>Incorrect</Text></View>
                </View>
               {warningMessage ? ( <View style={styles.warningContainer}><Ionicons name="warning-outline" size={20} color="#FFD700" /><Text style={styles.warningText}>{warningMessage}</Text></View> ) : null}
             </View>
             <View style={styles.controlsContainer}>
               <TouchableOpacity style={styles.controlButton} onPress={handleCameraSwitch}><Ionicons name="camera-reverse-outline" size={30} color="#fff" /></TouchableOpacity>
               <TouchableOpacity style={[styles.controlButton, styles.captureButtonOuter]} onPress={handleRecordVideo} onLongPress={handleTakePicture}>
                 <View style={[ styles.captureButtonInner, recording ? styles.recordingIndicator : null ]} />
               </TouchableOpacity>
               <View style={[styles.controlButton, { opacity: 0 }]} />
            </View>
        </View>
      </Camera>
    </View>
  );
};

// --- App component và Styles (giữ nguyên) ---
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Exercise List' }}/>
        <Stack.Screen name="Detail" component={DetailScreen} options={({ route }) => ({ title: route.params.item.title })}/>
        <Stack.Screen name="Camera" component={CameraScreen} options={{ headerShown: false }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// --- Styles (giữ nguyên) ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa', paddingTop: 20, alignItems: 'center', justifyContent: 'center' },
    header: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginVertical: 20, color: '#2c3e50' },
    list: { width: '100%' },
    item: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#ffffff', marginVertical: 8, marginHorizontal: 16, borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 3 },
    title: { fontSize: 20, color: '#34495e', fontWeight: '600', marginLeft: 15, flexShrink: 1 },
    image: { width: 80, height: 80, borderRadius: 8, resizeMode: 'contain' },
    detailContainer: { flex: 1, backgroundColor: '#ffffff', padding: 15 },
    detailVideo: { width: '100%', aspectRatio: 16 / 9, borderRadius: 10, marginBottom: 20, backgroundColor: '#000' },
    detailTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 10, color: '#2c3e50', textAlign: 'center' },
    detailDescription: { fontSize: 16, color: '#34495e', textAlign: 'left', marginBottom: 20, lineHeight: 22 },
    additionalInfoContainer: { backgroundColor: '#e9ecef', padding: 15, borderRadius: 8, width: '100%', marginBottom: 30 },
    additionalInfoTitle: { fontSize: 18, fontWeight: 'bold', color: '#495057', marginBottom: 10 },
    additionalInfoText: { fontSize: 15, color: '#495057', lineHeight: 21 },
    cameraButton: { flexDirection: 'row', backgroundColor: '#007BFF', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 25, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, marginTop: 'auto', marginBottom: 10 },
    cameraButtonText: { color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 8 },
    cameraContainer: { flex: 1, backgroundColor: '#000' },
    camera: { flex: 1 },
    cameraOverlay: { flex: 1, backgroundColor: 'transparent', justifyContent: 'space-between', padding: 20, paddingBottom: 40, paddingTop: 50 },
    analysisContainer: { alignItems: 'center' },
    percentageCircleContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '80%', marginBottom: 15 },
    percentageCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', borderWidth: 4, backgroundColor: 'rgba(0, 0, 0, 0.3)' },
    correctCircle: { borderColor: '#4CAF50' },
    incorrectCircle: { borderColor: '#F44336' },
    percentageText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    percentageLabel: { color: '#fff', fontSize: 12, marginTop: 2 },
    warningContainer: { flexDirection: 'row', backgroundColor: 'rgba(0, 0, 0, 0.6)', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, alignItems: 'center', marginTop: 10 },
    warningText: { color: '#FFD700', fontSize: 14, marginLeft: 8, fontWeight: 'bold' },
    controlsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
    controlButton: { padding: 15, borderRadius: 50, backgroundColor: 'rgba(0, 0, 0, 0.4)' },
    captureButtonOuter: { padding: 5, borderWidth: 3, borderColor: '#fff', borderRadius: 50, backgroundColor: 'transparent' },
    captureButtonInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
    recordingIndicator: { backgroundColor: '#F44336', width: 30, height: 30, borderRadius: 5 },
});