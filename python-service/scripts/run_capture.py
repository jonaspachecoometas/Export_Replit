#!/usr/bin/env python3
import argparse
import asyncio
import json
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.capture import capture_url, extract_requirements

async def main():
    parser = argparse.ArgumentParser(description='Capture web content')
    parser.add_argument('url', help='URL to capture')
    parser.add_argument('--wait', type=int, default=2000, help='Wait time in ms')
    parser.add_argument('--extract', action='store_true', help='Extract requirements with AI')
    parser.add_argument('--context', type=str, default='', help='Context for extraction')
    
    args = parser.parse_args()
    
    try:
        result = await capture_url(args.url, args.wait)
        
        if result.get('success') and args.extract and result.get('text_content'):
            extraction = await extract_requirements(result['text_content'], args.context)
            result['extraction'] = extraction.get('extraction') if extraction.get('success') else None
            result['extraction_error'] = extraction.get('error')
        
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({
            'success': False,
            'url': args.url,
            'error': str(e)
        }))
        sys.exit(1)

if __name__ == '__main__':
    asyncio.run(main())
