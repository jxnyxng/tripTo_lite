import requests
import json


class TravelCostService:
    """MCP Travel Cost 서버와 통신하는 서비스 클래스"""
    
    def __init__(self, base_url="http://localhost:3001"):
        self.base_url = base_url
    
    def get_travel_cost(self, destination, days, budget_level="mid", travelers=1, accommodation_type="호텔", total_budget=None, spending_level=None):
        """
        여행 경비를 계산하는 함수
        
        Args:
            destination (str): 여행지
            days (int): 여행 일수
            budget_level (str): 예산 수준 (budget, mid, luxury) - 예산 기반이 아닌 경우
            travelers (int): 여행자 수
            accommodation_type (str): 숙박 형태 (호텔, 게스트하우스, 리조트, 펜션)
            total_budget (int): 총 예산 (만원 단위) - 예산 기반 계산시
            spending_level (str): 지출 수준 (가성비 지출, 적당히 지출, 모두 지출) - 예산 기반 계산시
            
        Returns:
            dict: 계산된 여행 경비 정보
        """
        try:
            url = f"{self.base_url}/api/calculate-cost"
            payload = {
                "destination": destination,
                "days": days,
                "travelers": travelers,
                "accommodation_type": accommodation_type
            }
            
            # 예산 기반 계산 vs 레벨 기반 계산
            if total_budget and spending_level:
                payload["total_budget"] = total_budget
                payload["spending_level"] = spending_level
            else:
                payload["budget_level"] = budget_level
            
            response = requests.post(url, json=payload, timeout=10)
            response.raise_for_status()
            
            return response.json()
            
        except requests.exceptions.ConnectionError:
            print(f"[Travel Cost API 연결 오류]: {self.base_url}에 연결할 수 없습니다.")
            return None
        except requests.exceptions.Timeout:
            print("[Travel Cost API 타임아웃]: 응답이 늦습니다.")
            return None
        except Exception as e:
            print(f"[Travel Cost API 오류]: {str(e)}")
            return None
    
    def get_destination_info(self, destination):
        """
        여행지 정보를 가져오는 함수
        
        Args:
            destination (str): 여행지
            
        Returns:
            dict: 여행지 정보
        """
        try:
            url = f"{self.base_url}/api/destination/{destination}"
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            return response.json()
            
        except requests.exceptions.ConnectionError:
            print(f"[Travel Cost API 연결 오류]: {self.base_url}에 연결할 수 없습니다.")
            return None
        except Exception as e:
            print(f"[Travel Cost API 오류]: {str(e)}")
            return None
    
    def compare_destinations(self, destinations, days, budget_level="mid"):
        """
        여행지들을 비교하는 함수
        
        Args:
            destinations (list): 여행지 목록
            days (int): 여행 일수
            budget_level (str): 예산 수준
            
        Returns:
            dict: 비교 결과
        """
        try:
            url = f"{self.base_url}/api/compare-destinations"
            payload = {
                "destinations": destinations,
                "days": days,
                "budget_level": budget_level
            }
            
            response = requests.post(url, json=payload, timeout=10)
            response.raise_for_status()
            
            return response.json()
            
        except requests.exceptions.ConnectionError:
            print(f"[Travel Cost API 연결 오류]: {self.base_url}에 연결할 수 없습니다.")
            return None
        except Exception as e:
            print(f"[Travel Cost API 오류]: {str(e)}")
            return None
    
    def is_available(self):
        """
        Travel Cost API 서버가 사용 가능한지 확인하는 함수
        
        Returns:
            bool: 사용 가능 여부
        """
        try:
            url = f"{self.base_url}/health"
            response = requests.get(url, timeout=5)
            return response.status_code == 200
        except:
            return False


# 전역 인스턴스 생성
travel_cost_service = TravelCostService()
