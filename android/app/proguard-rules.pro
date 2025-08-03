# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# React Native Reanimated
-keep class reanimated.** { *; } 
-keep interface reanimated.** { *; } 

# React Native Gesture Handler
-keep class com.swmansion.gesturehandler.** { *; } 
-keep interface com.swmansion.gesturehandler.** { *; } 


# react-native-image-crop-picker
-keep class com.reactnative.ivpusic.imagepicker.** { *; }
-keep class com.yalantis.ucrop.** { *; }
-keep class com.theartofdev.edmodo.cropper.** { *; }
-keep class com.reactnative.picker.PickerModule { *; }
-keep class com.reactnative.picker.PickerPackage { *; }
-keep class com.reactnative.picker.PickerModule$* { *; }
-keep class com.reactnative.picker.PickerPackage$* { *; }

-keep public class com.dylanvann.fastimage.* {*;}
-keep public class com.dylanvann.fastimage.** {*;}
-keep public class * implements com.bumptech.glide.module.GlideModule
-keep public class * extends com.bumptech.glide.module.AppGlideModule
-keep public enum com.bumptech.glide.load.ImageHeaderParser$** {
  **[] $VALUES;
  public *;
}