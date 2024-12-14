// BranchSelectionSheet.tsx

import React from 'react';
import { ScrollView, Text, Pressable } from 'react-native';
import { Sheet, YStack, XStack } from 'tamagui';
import { AntDesign } from '@expo/vector-icons';

interface Branch {
  _id: string;
  name: string;
}

interface BranchSelectionSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  branches: Branch[];
  selectedBranch: Branch | null;
  setSelectedBranch: React.Dispatch<React.SetStateAction<Branch | null>>;
  colors: { [key: string]: string };
}

const BranchSelectionSheet: React.FC<BranchSelectionSheetProps> = ({
  isOpen,
  onOpenChange,
  branches,
  selectedBranch,
  setSelectedBranch,
  colors,
}) => {
  return (
    <Sheet
      open={isOpen}
      onOpenChange={onOpenChange}
      snapPoints={[80]}
      position={0}
      dismissOnSnapToBottom
    >
      <Sheet.Overlay style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }} />
      <Sheet.Frame
        style={{
          backgroundColor: '#ffffff',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: -4 },
        }}
      >
        <YStack
          alignItems="center"
          paddingTop={12}
          paddingBottom={6}
          style={{ backgroundColor: '#ffffff' }}
        >
          <YStack
            style={{
              width: 40,
              height: 5,
              borderRadius: 3,
              backgroundColor: colors.primary,
            }}
          />
        </YStack>

        <YStack
          style={{
            backgroundColor: '#ffffff',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
          }}
        >
          <YStack padding={16} space={8}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: colors.text,
                textAlign: 'center',
              }}
            >
              Select a Branch
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '400',
                color: colors.subtleText,
                textAlign: 'center',
              }}
            >
              Choose a preferred branch for your order
            </Text>
          </YStack>

          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: 24,
              paddingTop: 8,
            }}
          >
            {branches.map((branch) => {
              const isSelected = selectedBranch?._id === branch._id;
              return (
                <Pressable
                  key={branch._id}
                  onPress={() => {
                    setSelectedBranch(branch);
                    onOpenChange(false);
                  }}
                  style={{
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    borderRadius: 16,
                    marginBottom: 12,
                    backgroundColor: '#ffffff',
                    borderWidth: isSelected ? 1.5 : 1,
                    borderColor: isSelected ? colors.primary : '#dddddd',
                    shadowColor: isSelected ? colors.primary : '#000',
                    shadowOpacity: isSelected ? 0.1 : 0.05,
                    shadowRadius: isSelected ? 6 : 4,
                    shadowOffset: { width: 0, height: 2 },
                  }}
                >
                  <XStack justifyContent="space-between" alignItems="center">
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: isSelected ? '600' : '500',
                        color: colors.text,
                      }}
                    >
                      {branch.name}
                    </Text>
                    {isSelected && (
                      <AntDesign name="checkcircle" size={24} color={colors.primary} />
                    )}
                  </XStack>
                </Pressable>
              );
            })}
          </ScrollView>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
};

export default BranchSelectionSheet;
