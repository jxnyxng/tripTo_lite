import requests
import json


class TravelCostService:
    """MCP Travel Cost 서버와 통신하는 서비스 클래스"""
    
    def __init__(self, base_url="http://localhost:3001"):
        self.base_url = base_url
    
    def get_travel_cost(self, destination, days, budget_level="mid", travelers=1):
        """
        여행 경비를 계산하는 함수
        
        Args:
            destination (str): 여행지
            days (int): 여행 일수
            budget_level (str): 예산 수준 (budget, mid, luxury)
            travelers (int): 여행자 수
            
        Returns:
            dict: 계산된 여행 경비 정보
        """
        try:
            url = f"{self.base_url}/api/calculate-cost"
            payload = {
                "destination": destination,
                "days": days,
                "budget_level": budget_level,
                "travelers": travelers
            }
            
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
