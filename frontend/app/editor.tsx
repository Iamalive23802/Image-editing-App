import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Dimensions, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Save, Download, Share, Type, Image as ImageIcon, Palette, AlignLeft } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

const { width, height } = Dimensions.get('window');

export default function TemplateEditorPage() {
  const { templateId } = useLocalSearchParams();
  const [selectedElement, setSelectedElement] = useState(null);
  const [textElements, setTextElements] = useState([
    {
      id: 1,
      text: 'Happy Birthday!',
      x: 50,
      y: 100,
      fontSize: 32,
      color: '#FFFFFF',
      fontFamily: 'Arial',
      fontWeight: 'bold'
    },
    {
      id: 2,
      text: 'Wishing you a wonderful day',
      x: 50,
      y: 150,
      fontSize: 18,
      color: '#FFFFFF',
      fontFamily: 'Arial',
      fontWeight: 'normal'
    }
  ]);
  
  const [imageElements, setImageElements] = useState([
    {
      id: 1,
      uri: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=600&fit=crop',
      x: 0,
      y: 0,
      width: width,
      height: 200,
      type: 'background'
    },
    {
      id: 2,
      uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
      x: width - 120,
      y: 50,
      width: 100,
      height: 100,
      type: 'overlay'
    }
  ]);

  const [activeTab, setActiveTab] = useState('text');

  const handleTextChange = (elementId, newText) => {
    setTextElements(prev => 
      prev.map(el => el.id === elementId ? { ...el, text: newText } : el)
    );
  };

  const handleImageChange = (elementId, newUri) => {
    setImageElements(prev => 
      prev.map(el => el.id === elementId ? { ...el, uri: newUri } : el)
    );
  };

  const handleSave = () => {
    Alert.alert('Success', 'Your design has been saved!');
  };

  const handleDownload = () => {
    Alert.alert('Download', 'Your design is being prepared for download...');
  };

  const handleShare = () => {
    Alert.alert('Share', 'Sharing your design...');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#8B2E5A', '#A84369']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Template</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
              <Save size={20} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleDownload}>
              <Download size={20} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Share size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Mobile Canvas Area - Full Screen */}
      <View style={styles.canvasContainer}>
        <View style={styles.canvas}>
          {/* Background Images */}
          {imageElements.filter(img => img.type === 'background').map((image) => (
            <Image
              key={image.id}
              source={{ uri: image.uri }}
              style={[
                styles.canvasImage,
                {
                  position: 'absolute',
                  top: image.y,
                  left: image.x,
                  width: image.width,
                  height: image.height,
                  zIndex: 1
                }
              ]}
              resizeMode="cover"
            />
          ))}
          
          {/* Overlay Images */}
          {imageElements.filter(img => img.type === 'overlay').map((image) => (
            <TouchableOpacity
              key={image.id}
              onPress={() => setSelectedElement({ type: 'image', id: image.id })}
              style={[
                styles.canvasImage,
                {
                  position: 'absolute',
                  top: image.y,
                  left: image.x,
                  width: image.width,
                  height: image.height,
                  zIndex: 3,
                  borderRadius: 8,
                  borderWidth: selectedElement?.id === image.id ? 3 : 0,
                  borderColor: '#FDD835'
                }
              ]}
            >
              <Image
                source={{ uri: image.uri }}
                style={styles.canvasImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
          
          {/* Text Elements */}
          {textElements.map((textEl) => (
            <TouchableOpacity
              key={textEl.id}
              onPress={() => setSelectedElement({ type: 'text', id: textEl.id })}
              style={[
                styles.textElement,
                {
                  position: 'absolute',
                  top: textEl.y,
                  left: textEl.x,
                  zIndex: 2,
                  borderWidth: selectedElement?.id === textEl.id ? 3 : 0,
                  borderColor: '#FDD835',
                  borderRadius: 8,
                  padding: 8,
                  minWidth: 60,
                  minHeight: 30,
                }
              ]}
            >
              <Text
                style={[
                  styles.textContent,
                  {
                    fontSize: textEl.fontSize,
                    color: textEl.color,
                    fontWeight: textEl.fontWeight
                  }
                ]}
              >
                {textEl.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Mobile Bottom Editor Panel */}
      <View style={styles.mobileEditorPanel}>
        <View style={styles.mobileTabContainer}>
          <TouchableOpacity
            style={[styles.mobileTab, activeTab === 'text' && styles.mobileActiveTab]}
            onPress={() => setActiveTab('text')}
          >
            <Type size={24} color={activeTab === 'text' ? '#FFF' : '#8B2E5A'} />
            <Text style={[styles.mobileTabText, activeTab === 'text' && styles.mobileActiveTabText]}>
              Text
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.mobileTab, activeTab === 'image' && styles.mobileActiveTab]}
            onPress={() => setActiveTab('image')}
          >
            <ImageIcon size={24} color={activeTab === 'image' ? '#FFF' : '#8B2E5A'} />
            <Text style={[styles.mobileTabText, activeTab === 'image' && styles.mobileActiveTabText]}>
              Images
            </Text>
          </TouchableOpacity>
        </View>

        {/* Mobile Text Editor */}
        {activeTab === 'text' && selectedElement?.type === 'text' && (
          <ScrollView style={styles.mobileEditorContent} showsVerticalScrollIndicator={false}>
            <View style={styles.mobileSection}>
              <Text style={styles.mobileSectionTitle}>Edit Text</Text>
              <TextInput
                style={styles.mobileTextInput}
                value={textElements.find(el => el.id === selectedElement.id)?.text || ''}
                onChangeText={(text) => handleTextChange(selectedElement.id, text)}
                placeholder="Enter your text"
                multiline
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.mobileSection}>
              <Text style={styles.mobileSectionTitle}>Font Size</Text>
              <View style={styles.mobileSliderContainer}>
                <Text style={styles.mobileSliderLabel}>12</Text>
                <View style={styles.mobileSlider} />
                <Text style={styles.mobileSliderLabel}>72</Text>
              </View>
            </View>

            <View style={styles.mobileSection}>
              <Text style={styles.mobileSectionTitle}>Text Color</Text>
              <View style={styles.mobileColorPalette}>
                {['#FFFFFF', '#000000', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'].map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.mobileColorOption, 
                      { backgroundColor: color },
                      textElements.find(el => el.id === selectedElement.id)?.color === color && styles.selectedColor
                    ]}
                    onPress={() => {
                      setTextElements(prev => 
                        prev.map(el => el.id === selectedElement.id ? { ...el, color } : el)
                      );
                    }}
                  />
                ))}
              </View>
            </View>
          </ScrollView>
        )}

        {/* Mobile Image Editor */}
        {activeTab === 'image' && selectedElement?.type === 'image' && (
          <ScrollView style={styles.mobileEditorContent} showsVerticalScrollIndicator={false}>
            <View style={styles.mobileSection}>
              <Text style={styles.mobileSectionTitle}>Replace Image</Text>
              <TouchableOpacity style={styles.mobileImageButton}>
                <ImageIcon size={28} color="#8B2E5A" />
                <Text style={styles.mobileImageButtonText}>Choose New Image</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.mobileSection}>
              <Text style={styles.mobileSectionTitle}>Image Size</Text>
              <View style={styles.mobileSliderContainer}>
                <Text style={styles.mobileSliderLabel}>Small</Text>
                <View style={styles.mobileSlider} />
                <Text style={styles.mobileSliderLabel}>Large</Text>
              </View>
            </View>

            <View style={styles.mobileSection}>
              <Text style={styles.mobileSectionTitle}>Position</Text>
              <View style={styles.mobilePositionGrid}>
                {['Top Left', 'Top Right', 'Bottom Left', 'Bottom Right', 'Center'].map((position) => (
                  <TouchableOpacity key={position} style={styles.mobilePositionOption}>
                    <Text style={styles.mobilePositionText}>{position}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        )}

        {/* Mobile Default State */}
        {!selectedElement && (
          <View style={styles.mobileDefaultState}>
            <AlignLeft size={64} color="#CCC" />
            <Text style={styles.mobileDefaultText}>Tap to Edit</Text>
            <Text style={styles.mobileDefaultSubtext}>Select text or images in the canvas to start editing</Text>
          </View>
        )}
      </View>

      {/* Consistent Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.footerItem}
          onPress={() => router.push('/(tabs)')}
        >
          <ArrowLeft size={24} color="#FFF" />
          <Text style={styles.footerLabel}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.footerItem}>
          <Type size={24} color="#888" />
          <Text style={styles.footerLabel}>Text</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.footerItem}>
          <ImageIcon size={24} color="#888" />
          <Text style={styles.footerLabel}>Images</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.footerItem}>
          <Palette size={24} color="#888" />
          <Text style={styles.footerLabel}>Colors</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.footerItem}>
          <Download size={24} color="#888" />
          <Text style={styles.footerLabel}>Export</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvasContainer: {
    flex: 1,
    padding: 15,
    paddingBottom: 0,
  },
  canvas: {
    width: '100%',
    height: height * 0.5,
    backgroundColor: '#FFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  canvasImage: {
    width: '100%',
    height: '100%',
  },
  textElement: {
    padding: 8,
    borderRadius: 4,
  },
  textContent: {
    fontSize: 16,
  },
  editorPanel: {
    width: 300,
    backgroundColor: '#FFF',
    borderLeftWidth: 1,
    borderLeftColor: '#E0E0E0',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#F0F0F0',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#8B2E5A',
  },
  editorContent: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  slider: {
    flex: 1,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#666',
  },
  colorPalette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderWidth: 2,
    borderColor: '#8B2E5A',
    borderStyle: 'dashed',
    borderRadius: 8,
    gap: 10,
  },
  imageButtonText: {
    color: '#8B2E5A',
    fontSize: 16,
    fontWeight: '600',
  },
  positionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  positionOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 6,
  },
  positionText: {
    fontSize: 12,
    color: '#666',
  },
  defaultState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  defaultText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  defaultSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(10px)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 70,
    paddingBottom: 10,
    paddingTop: 10,
  },
  footerItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  footerLabel: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  // Mobile-specific styles
  mobileEditorPanel: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    maxHeight: height * 0.4,
  },
  mobileTabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  mobileTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  mobileActiveTab: {
    backgroundColor: '#8B2E5A',
    margin: 8,
    borderRadius: 12,
  },
  mobileTabText: {
    fontSize: 16,
    color: '#8B2E5A',
    fontWeight: '600',
  },
  mobileActiveTabText: {
    color: '#FFF',
  },
  mobileEditorContent: {
    padding: 20,
  },
  mobileSection: {
    marginBottom: 24,
  },
  mobileSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  mobileTextInput: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#F8F8F8',
  },
  mobileSliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 8,
  },
  mobileSlider: {
    flex: 1,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
  },
  mobileSliderLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  mobileColorPalette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mobileColorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#E0E0E0',
  },
  selectedColor: {
    borderColor: '#8B2E5A',
    borderWidth: 4,
  },
  mobileImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderWidth: 2,
    borderColor: '#8B2E5A',
    borderStyle: 'dashed',
    borderRadius: 12,
    gap: 12,
    backgroundColor: '#F8F8F8',
  },
  mobileImageButtonText: {
    color: '#8B2E5A',
    fontSize: 18,
    fontWeight: '600',
  },
  mobilePositionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mobilePositionOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  mobilePositionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  mobileDefaultState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  mobileDefaultText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  mobileDefaultSubtext: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
});
