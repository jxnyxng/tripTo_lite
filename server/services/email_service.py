import smtplib
from email.mime.text import MIMEText
from config.settings import SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD


def send_travel_email(to_email, subject, html_content):
    """
    여행지 추천 결과를 이메일로 전송하는 함수
    
    Args:
        to_email (str): 수신자 이메일 주소
        subject (str): 이메일 제목
        html_content (str): HTML 형식의 이메일 내용
        
    Returns:
        dict: 전송 결과 (success: bool, message: str, error: str)
    """
    print(f"[이메일 전송 요청] to: {to_email}, subject: {subject}")
    
    try:
        # 필수 입력값 검증
        if not to_email or not html_content:
            return {
                'success': False,
                'error': '이메일 주소와 내용이 필요합니다.'
            }
        
        # SMTP 설정 검증
        smtp_config = _validate_smtp_config()
        if not smtp_config['valid']:
            return {
                'success': False,
                'error': smtp_config['error']
            }
        
        # 이메일 메시지 생성
        msg = _create_email_message(to_email, subject, html_content)
        
        # 이메일 전송
        _send_email_message(msg, smtp_config)
        
        print("[이메일 전송 성공]")
        return {
            'success': True,
            'message': '이메일이 성공적으로 전송되었습니다.'
        }
        
    except Exception as e:
        print(f"[이메일 전송 오류]: {str(e)}")
        return {
            'success': False,
            'error': f'이메일 전송 중 오류가 발생했습니다: {str(e)}'
        }


def _validate_smtp_config():
    """SMTP 설정을 검증하는 내부 함수"""
    print(f"[SMTP 설정] host: {SMTP_HOST}, port: {SMTP_PORT}, user: {SMTP_USER}")
    print(f"[SMTP 설정] password 존재: {'예' if SMTP_PASSWORD else '아니오'}")
    
    smtp_port = int(SMTP_PORT) if SMTP_PORT else 587
    
    if not all([SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD]):
        print("[SMTP 오류] 설정이 완료되지 않았습니다.")
        return {
            'valid': False,
            'error': 'SMTP 설정이 완료되지 않았습니다.'
        }
    
    return {
        'valid': True,
        'host': SMTP_HOST,
        'port': smtp_port,
        'user': SMTP_USER,
        'password': SMTP_PASSWORD
    }


def _create_email_message(to_email, subject, html_content):
    """이메일 메시지를 생성하는 내부 함수"""
    msg = MIMEText(html_content, 'html', 'utf-8')
    msg['Subject'] = subject
    msg['From'] = SMTP_USER
    msg['To'] = to_email
    return msg


def _send_email_message(msg, smtp_config):
    """이메일 메시지를 실제로 전송하는 내부 함수"""
    with smtplib.SMTP(smtp_config['host'], smtp_config['port']) as server:
        server.starttls()
        server.login(smtp_config['user'], smtp_config['password'])
        server.send_message(msg)
