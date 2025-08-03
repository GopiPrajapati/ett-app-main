import SoundPlayer from 'react-native-sound-player';

export function useSound() {
  const play = () => {
    try {
      const fileName = 'feed_message';
      const type = 'mp3';
      SoundPlayer.playSoundFile(fileName, type);
      SoundPlayer.setVolume(0.2);
    } catch (error) {
      console.log('Error playing sound', error);
    }
  };

  return {play};
}
