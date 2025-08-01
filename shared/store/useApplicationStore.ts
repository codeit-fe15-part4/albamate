import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 비회원 지원서 데이터 타입
export interface GuestApplicationData {
  id: number;
  name: string;
  phoneNumber: string;
  experienceMonths: number;
  resumeId: number;
  resumeName: string;
  introduction: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  applicantId: number;
}

interface ApplicationStore {
  // 비회원 지원서 데이터
  guestApplication: GuestApplicationData | null;
  isGuestMode: boolean;
  // hydration 상태 추가
  _hasHydrated: boolean;

  // Actions
  setGuestApplication: (data: GuestApplicationData) => void;
  clearGuestApplication: () => void;
  setGuestMode: (mode: boolean) => void;
  setHasHydrated: (state: boolean) => void;
}

const useApplicationStore = create<ApplicationStore>()(
  persist(
    (set, get) => ({
      // Initial state
      guestApplication: null,
      isGuestMode: false,
      _hasHydrated: false,

      // Actions
      setGuestApplication: (data: GuestApplicationData) => {
        console.log('💾 setGuestApplication 호출:', data);
        set({
          guestApplication: data,
          isGuestMode: true,
        });
      },

      clearGuestApplication: () => {
        console.log('🗑️ clearGuestApplication 호출');
        set({
          guestApplication: null,
          isGuestMode: false,
        });
        // sessionStorage도 함께 정리
        sessionStorage.removeItem('guestApplication');
      },

      setGuestMode: (mode: boolean) => {
        console.log('🔄 setGuestMode 호출:', mode);
        set({ isGuestMode: mode });
      },

      setHasHydrated: (state: boolean) => {
        console.log('💧 setHasHydrated 호출:', state);
        set({ _hasHydrated: state });
      },
    }),
    {
      name: 'application-store', // localStorage key
      partialize: state => ({
        guestApplication: state.guestApplication,
        isGuestMode: state.isGuestMode,
      }),
      onRehydrateStorage: () => state => {
        console.log('🔄 Zustand hydration 시작');
        return (state, error) => {
          if (error) {
            console.error('❌ Zustand hydration 실패:', error);
          } else {
            console.log('✅ Zustand hydration 완료:', {
              guestApplication: state?.guestApplication,
              isGuestMode: state?.isGuestMode,
            });
            
            // hydration 완료 후 sessionStorage도 확인
            if (state && !state.guestApplication && !state.isGuestMode) {
              try {
                const sessionData = sessionStorage.getItem('guestApplication');
                if (sessionData) {
                  const parsedSession = JSON.parse(sessionData);
                  console.log('📦 sessionStorage에서 데이터 발견:', parsedSession);
                  
                  // 5분 이내 데이터만 유효
                  if (Date.now() - parsedSession.timestamp < 5 * 60 * 1000) {
                    console.log('🔄 sessionStorage에서 게스트 데이터 복원');
                    state.setGuestApplication(parsedSession.data);
                  } else {
                    console.log('⏰ sessionStorage 데이터 만료됨');
                    sessionStorage.removeItem('guestApplication');
                  }
                }
              } catch (error) {
                console.error('sessionStorage 복원 실패:', error);
              }
            }
          }
          state?.setHasHydrated(true);
        };
      },
    }
  )
);

export default useApplicationStore;