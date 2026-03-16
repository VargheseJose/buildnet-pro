import * as React from 'react';

// To allow CategoryCard to use icon names without importing this whole file
export type IconName = 'location' | 'search' | 'building' | 'phone' | 'whatsapp' | 'email' | 'website' | 'map' | 'chat' | 'send' | 'upload' | 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'star' | 'chevron-down' | 'document-text' | 'squares-plus' | 'cog' | 'crane' | 'truck' | 'tractor' | 'chart-bar' | 'user-hard-hat' | 'refresh' | 'bolt' | 'cart' | 'apps' | 'x-mark' | 'share' | 'clipboard' | 'menu' | 'calculator' | 'leaf' | 'database' | 'heart' | 'camera' | 'cube' | 'check' | 'bookmark' | 'calendar' | 'download' | 'print' | 'plus' | 'chat-bubble-left-right' | 'arrow-left' | 'paper-airplane' | 'paper-clip' | 'document' | 'user' | 'photo' | 'briefcase' | 'arrow-right' | 'eye' | 'eye-off' | 'bell' | 'trash' | 'key';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
}

export const Icon: React.FC<IconProps> = ({ name, ...props }) => {
  const svgProps = {
    width: "100%",
    height: "100%",
    ...props
  };

  switch (name) {
    case 'trash':
        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...svgProps}>
                <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clipRule="evenodd" />
            </svg>
        );
    case 'key':
        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...svgProps}>
                <path fillRule="evenodd" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818l5.73-5.73a1.5 1.5 0 00.43-1.563 6 6 0 1110.89-4.56z" clipRule="evenodd" />
            </svg>
        );
    case 'location':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...svgProps}>
          <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.1.4-.27.653-.495l6.288-5.329a5.5 5.5 0 00-9.5-6.598l-.001-.001a5.5 5.5 0 00-9.5 6.598l6.288 5.329c.253.226.467.395.653.495a5.741 5.741 0 00.281.14l.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
        </svg>
      );
    case 'search':
        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...svgProps}>
                <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clipRule="evenodd" />
            </svg>
        );
    case 'building':
        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...svgProps}>
              <path fillRule="evenodd" d="M4 16.5v-13h-.25a.75.75 0 010-1.5h12.5a.75.75 0 010 1.5H16v13h.25a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75v-3.5a.75.75 0 00-.75-.75h-1.5a.75.75 0 00-.75.75v3.5a.75.75 0 01-.75.75h-4.5a.75.75 0 010-1.5H4zM8 6a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 018 6zm3.25.75a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0v-1.5zM8 10a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 018 10zm3.25.75a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0v-1.5z" clipRule="evenodd" />
            </svg>
        );
     case 'phone':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...svgProps}>
          <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5h-1.528a1.5 1.5 0 01-1.465-1.175l-.716-3.223a1.5 1.5 0 01.442-1.693l.707-.707a1.5 1.5 0 00-2.121-2.121l-.707.707A1.5 1.5 0 017.34 8.65l-3.223-.716A1.5 1.5 0 012.969 6.472H2V3.5z" clipRule="evenodd" />
        </svg>
      );
    case 'whatsapp':
        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...svgProps}>
                <path d="M16.6 14.2c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.7-.8.9-.1.1-.3.1-.5 0-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6s0-.3.1-.4c.1-.1.2-.2.4-.4.1-.1.2-.3.0-.5-.1-.2-.6-1.5-.8-2.1-.2-.5-.4-.5-.5h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2 1 2.4c.1.1 1.5 2.3 3.7 3.2.5.2.9.4 1.2.5.5.2 1 .1 1.4-.1.4-.2.6-.7.8-1s.1-.9 0-1zM12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z" />
            </svg>
        );
    case 'email':
        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...svgProps}>
              <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
              <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
            </svg>
        );
    case 'website':
        return (
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...svgProps}>
                <path d="M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a4 4 0 00.225 5.865.75.75 0 00.977-1.138 2.5 2.5 0 01-.142-3.667l3-3z" />
                <path d="M11.603 7.963a.75.75 0 00-.977 1.138 2.5 2.5 0 01.142 3.667l-3 3a2.5 2.5 0 01-3.536-3.536l1.225-1.224a.75.75 0 00-1.061-1.06l-1.224 1.224a4 4 0 005.656 5.656l3-3a4 4 0 00-.225-5.865z" />
            </svg>
        );
    case 'map':
        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...svgProps}>
                <path fillRule="evenodd" d="M11.955 3.329a.75.75 0 01.09 1.056l-4.25 6.5a.75.75 0 01-1.145-.71l4.25-6.5a.75.75 0 011.055-.346ZM13.045 4.385a.75.75 0 00-1.056-.09l-4.25 2.75a.75.75 0 00.61 1.28l4.25-2.75a.75.75 0 00-.554-1.19ZM9.05 11.03a.75.75 0 01.09 1.056l-2.75 4.25a.75.75 0 01-1.145-.71l2.75-4.25a.75.75 0 011.055-.346ZM10.14 12.095a.75.75 0 00-1.056-.09l-2.75 1.75a.75.75 0 00.61 1.28l2.75-1.75a.75.75 0 00-.554-1.19ZM15.5 9.75a5.5 5.5 0 11-11 0 5.5 5.5 0 0111 0z" clipRule="evenodd"/>
            </svg>
        );
    case 'chat':
        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...svgProps}>
              <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 006 21.75a6.75 6.75 0 006.75-6.75v-2.5a.75.75 0 011.5 0v2.5a8.25 8.25 0 01-8.25 8.25c-1.32 0-2.58-.3-3.735-.853a.75.75 0 01-.465-1.025l.488-1.141a.75.75 0 011.025-.465z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M6.75 2.25A6.75 6.75 0 000 9v.75a8.25 8.25 0 005.25 7.723l.14.052a.75.75 0 01.466 1.024l-.488 1.141a.75.75 0 01-1.024.465A9.728 9.728 0 010 17.25V9C0 4.86 3.02 1.5 6.75 1.5S13.5 4.86 13.5 9v2.25a2.25 2.25 0 01-2.25 2.25H9a.75.75 0 010-1.5h2.25A.75.75 0 0012 11.25V9A5.25 5.25 0 006.75 3.75zM15 9.75a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75h-.01a.75.75 0 01-.75-.75V9.75zM18.75 9.75a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75h-.01a.75.75 0 01-.75-.75V9.75zM18 12.75a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75-.75h-.01a.75.75 0 01-.75-.75v-.01z" clipRule="evenodd" />
            </svg>
        );
    case 'send':
        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...svgProps}>
              <path d="M3.105 3.105a.75.75 0 011.06 0L6 4.94V3.75a.75.75 0 011.5 0v3a.75.75 0 01-.75.75h-3a.75.75 0 010-1.5h1.19L3.105 4.165a.75.75 0 010-1.06zM16.895 16.895a.75.75 0 01-1.06 0L14 15.06v1.25a.75.75 0 01-1.5 0v-3a.75.75 0 01.75-.75h3a.75.75 0 010 1.5h-1.19l1.885 1.885a.75.75 0 010 1.06z" />
            </svg>
        );
    case 'upload':
        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...svgProps}>
              <path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v10.5a.75.75 0 01-1.5 0V2.75A.75.75 0 0110 2z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M8.75 4a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 018.75 4zM11.25 4a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5a.75.75 0 01.75.75z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M5.525 8.322a.75.75 0 011.06 0L10 11.737l3.415-3.415a.75.75 0 111.06 1.06l-4 4a.75.75 0 01-1.06 0l-4-4a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
        );
    case 'facebook':
        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...svgProps}>
              <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
            </svg>
        );
    case 'twitter':
        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...svgProps}>
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
        );
     case 'instagram':
        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...svgProps}>
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.585-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.85-.07-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.585.069-4.85c.149-3.225 1.664-4.771 4.919-4.919 1.266-.058 1.644-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.059-1.281.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98C15.667.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z"/>
            </svg>
        );
    case 'linkedin':
        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...svgProps}>
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
        );
    case 'star':
        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...svgProps}>
                <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.116 3.986 1.237 5.353c.275 1.185-.988 2.112-2.023 1.549L12 18.066l-4.545 2.768c-1.035.563-2.298-.364-2.023-1.549l1.237-5.353-4.116-3.986c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.007z" clipRule="evenodd" />
            </svg>
        );
    case 'chevron-down':
        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...svgProps}>
              <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
        );
     case 'document-text':
        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...svgProps}>
                <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a.375.375 0 01-.375-.375V6.75A3.75 3.75 0 009 3H5.625zM12.75 12.75a.75.75 0 000-1.5h-3a.75.75 0 000 1.5h3zM11.25 15a.75.75 0 01.75.75v.008a.75.75 0 01-1.5 0V15.75a.75.75 0 011.75-.75zM10.5 12a.75.75 0 00-1.5 0v.008a.75.75 0 001.5 0V12zm2.25 3.75a.75.75 0 00-1.5 0v.008a.75.75 0 001.5 0v-.008zM15 12.75a.75.75 0 01.75.75v.008a.75.75 0 01-1.5 0V13.5a.75.75 0 011.75-.75zm.75 2.25a.75.75 0 00-1.5 0v.008a.75.75 0 001.5 0v-.008zM15 9.75a.75.75 0 01.75.75v.008a.75.75 0 01-1.5 0V10.5a.75.75 0 011.75-.75zM12.75 9a.75.75 0 000 1.5h.008a.75.75 0 000-1.5H12.75z" clipRule="evenodd" />
            </svg>
        );
    case 'squares-plus':
        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...svgProps}>
              <path fillRule="evenodd" d="M3.75 3.75a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75h-4.5a.75.75 0 01-.75-.75v-4.5zM3.75 10.5a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75h-4.5a.75.75 0 01-.75-.75v-4.5zM10.5 3.75a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75h-4.5a.75.75 0 01-.75-.75v-4.5zM14.25 11.25a.75.75 0 00-1.5 0v2.25h-2.25a.75.75 0 000 1.5h2.25v2.25a.75.75 0 001.5 0v-2.25h2.25a.75.75 0 000-1.5h-2.25V11.25z" clipRule="evenodd" />
            </svg>
        );
    case 'cog':
        return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...svgProps}><path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 5.85c-.09.55-.443.99-.98 1.135L4.846 7.96a1.875 1.875 0 00-2.372 2.372l.946 3.226c.145.49.145 1.027 0 1.517l-.946 3.226a1.875 1.875 0 002.372 2.372l3.226-.946a1.125 1.125 0 011.135-.98l2.133-.173c.917 0 1.699-.663 1.85-1.567l.173-2.133c.09-.55.443-.99.98-1.135l3.226-.946a1.875 1.875 0 00-2.372-2.372l-3.226.946a1.125 1.125 0 01-1.135.98l-2.133.173c-.917 0-1.699.663-1.85 1.567l-.173 2.133a1.125 1.125 0 01-.98 1.135L5.85 14.95l-.946-3.226a2.625 2.625 0 010-2.248l.946-3.226L8.077 5.3a1.125 1.125 0 01.98-1.135l2.133-.173c.917 0 1.699-.663 1.85-1.567L13.218 2.25h-2.14zM12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z" clipRule="evenodd" /></svg>
    case 'crane':
        return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...svgProps}><path d="M21.75 10.5a.75.75 0 00-1.5 0v8.25h-6v-5.25a3 3 0 00-3-3h-1.5a3 3 0 00-3 3v5.25H3v-8.25a.75.75 0 00-1.5 0V19.5a.75.75 0 00.75.75h18a.75.75 0 00.75-.75v-9z" /><path fillRule="evenodd" d="M12.75 2.25a.75.75 0 01.75.75v5.5a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75z" clipRule="evenodd" /><path fillRule="evenodd" d="M3.75 8.25a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75z" clipRule="evenodd" /><path fillRule="evenodd" d="M11.25 5.25a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75z" clipRule="evenodd" /></svg>
    case 'truck':
        return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...svgProps}><path fillRule="evenodd" d="M7.5 5.25a3 3 0 013-3h3a3 3 0 013 3v.5a.5.5 0 01-.5.5h-8a.5.5 0 01-.5-.5v-.5z" clipRule="evenodd" /><path d="M3.75 9.75a.75.75 0 01.75-.75h15a.75.75 0 01.75.75v6a.75.75 0 01-.75.75h-2.018a3 3 0 01-5.964 0H6.768a3 3 0 01-5.964 0H3.75a.75.75 0 01-.75-.75v-6zM16.5 19.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0zM8.25 19.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0z" /></svg>
    case 'tractor':
        return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...svgProps}><path d="M21.75 12.75a.75.75 0 00-1.5 0v2.25H3v-3.855c0-.53.193-1.036.538-1.43l3.25-3.513c.345-.395.84-1.002.84-1.637a.75.75 0 00-.75-.75H3a.75.75 0 000 1.5h2.188c.03.02.059.043.085.068l-3.25 3.513A3.75 3.75 0 001.5 11.145v4.605a.75.75 0 00.75.75h18a.75.75 0 00.75-.75v-3z" /><path fillRule="evenodd" d="M12 18a3.75 3.75 0 10-7.5 0 3.75 3.75 0 007.5 0zm-1.5-3.75a2.25 2.25 0 10-4.5 0 2.25 2.25 0 004.5 0z" clipRule="evenodd" /></svg>
    case 'chart-bar':
        return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...svgProps}><path d="M3 3v18h18V3H3zm8 14H7v-5h4v5zm0-7H7V6h4v4zm6 7h-4v-3h4v3zm0-5h-4V6h4v8z" /></svg>
    case 'user-hard-hat':
        return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...svgProps}><path d="M12 2a5 5 0 00-5 5v1.25a1.25 1.25 0 001.25 1.25h7.5A1.25 1.25 0 0017 8.25V7a5 5 0 00-5-5z" /><path d="M12 11a4 4 0 100 8 4 4 0 000-8zm0 6a2 2 0 110-4 2 2 0 010 4z" /><path d="M18.75 13a.75.75 0 00-1.5 0v3a.75.75 0 001.5 0v-3z" /></svg>
    case 'refresh':
        return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...svgProps}><path fillRule="evenodd" d="M11.998 2.5A9.503 9.503 0 003.5 12a9.5 9.5 0 008.001 9.493a.75.75 0 00.997-.749a.748.748 0 00-.547-.696A7.999 7.999 0 015 12a8 8 0 018-8a7.999 7.999 0 017.743 6.002a.75.75 0 001.494-.105A9.503 9.503 0 0011.998 2.5z" clipRule="evenodd" /></svg>
    case 'bolt':
        return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...svgProps}><path d="M11.983 1.907a.75.75 0 00-1.292-.75L3 10.75a.75.75 0 00.75.75h4.483v4.695a.75.75 0 001.292.75L17 9.25a.75.75 0 00-.75-.75h-4.483V1.907z" /></svg>
    case 'cart':
        return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...svgProps}><path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.744-.647l2.25-8.25a.75.75 0 00-.744-.853H4.267L3.622 3.126A.75.75 0 002.87 2.25H2.25z" /><path d="M8.25 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM18.75 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /></svg>
    case 'apps':
        return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...svgProps}><path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h3a3 3 0 013 3v3a3 3 0 01-3 3h-3a3 3 0 01-3-3v-3zm12 0a3 3 0 013-3h3a3 3 0 013 3v3a3 3 0 01-3 3h-3a3 3 0 01-3-3v-3zM1.5 13.5a3 3 0 013-3h3a3 3 0 013 3v3a3 3 0 01-3 3h-3a3 3 0 01-3-3v-3zm12 0a3 3 0 013-3h3a3 3 0 013 3v3a3 3 0 01-3 3h-3a3 3 0 01-3-3v-3z" clipRule="evenodd" /></svg>
    case 'x-mark':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...svgProps}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    case 'share':
        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...svgProps}>
              <path d="M13 4.5a2.5 2.5 0 11.702 4.283l-4.423 2.212a2.51 2.51 0 010 1.01l4.423 2.212a2.5 2.5 0 11-.552.894l-4.423-2.212a2.5 2.5 0 110-2.806l4.423-2.212A2.5 2.5 0 0113 4.5z" />
            </svg>
        );
    case 'clipboard':
        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...svgProps}>
              <path fillRule="evenodd" d="M14.5 1A1.5 1.5 0 0116 2.5v1.75a.75.75 0 01-1.5 0V2.5a.5.5 0 00-.5-.5h-10a.5.5 0 00-.5.5V15c0 .276.224.5.5.5h2.121a.75.75 0 010 1.5H4.5A1.5 1.5 0 013 15.5V2.5A1.5 1.5 0 014.5 1h10z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M9 4.75a.75.75 0 01.75.75v5.5a.75.75 0 01-1.5 0v-5.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M12.5 7.25a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v6.5a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75v-6.5z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M9.75 12.5a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0v-1.5z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M12 9.5a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
            </svg>
        );
    case 'menu':
        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...svgProps}>
                <path fillRule="evenodd" d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
            </svg>
        );
    case 'calculator':
        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...svgProps}>
              <path fillRule="evenodd" d="M4.5 2.25a.75.75 0 00-.75.75v18a.75.75 0 00.75.75h15a.75.75 0 00.75-.75v-18a.75.75 0 00-.75-.75h-15zM13.5 6a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm-3 4.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm3 4.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm-3 4.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm6-9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm-3 4.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm3 4.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm-9-9a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm0 4.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm-3 4.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd" />
            </svg>
        );
    case 'leaf':
        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...svgProps}>
                <path fillRule="evenodd" d="M5.167 2.623c.856.127 1.743.348 2.636.666a33.58 33.58 0 0 1 5.92 3.165.75.75 0 0 1 .28.913 23.366 23.366 0 0 0-1.722 5.094c-.067.447-.132.898-.192 1.349.882.355 1.75.733 2.597 1.134.425.2.846.41 1.261.63a.75.75 0 0 1 .324.974c-.394.887-.905 1.761-1.554 2.576A10.465 10.465 0 0 1 11.25 21a.75.75 0 0 1-.75-.75V19a6 6 0 0 1-6-6V9.674a24.264 24.264 0 0 1-2.03-3.87.75.75 0 0 1 .472-.942 22.848 22.848 0 0 1 2.225-.49V2.623zM9 13.04a4.502 4.502 0 0 0 1.5.255 18.23 18.23 0 0 1 .74-2.81 21.905 21.905 0 0 0-2.24-2.678V13.04z" clipRule="evenodd" />
            </svg>
        );
    case 'database':
        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...svgProps}>
              <path d="M21 6.375c0 2.692-4.03 4.875-9 4.875S3 9.067 3 6.375 7.03 1.5 12 1.5s9 2.183 9 4.875z" />
              <path d="M12 12.75c2.685 0 5.19-.504 6.955-1.344a.75.75 0 00-.475-1.355 13.61 13.61 0 01-6.48.324 13.61 13.61 0 01-6.48-.324.75.75 0 00-.475 1.355C6.81 12.246 9.315 12.75 12 12.75z" />
              <path d="M21 11.625c0 2.692-4.03 4.875-9 4.875s-9-2.183-9-4.875v-1.5c0 2.692 4.03 4.875 9 4.875s9-2.183 9-4.875v1.5z" />
              <path d="M21 16.875c0 2.692-4.03 4.875-9 4.875s-9-2.183-9-4.875v-1.5c0 2.692 4.03 4.875 9 4.875s9-2.183 9-4.875v1.5z" />
            </svg>
        );
    case 'heart':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...svgProps}>
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
        </svg>
      );
    case 'camera':
      return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...svgProps}>
            <path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
            <path fillRule="evenodd" d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 01-3 3h-15a3 3 0 01-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 001.11-.71l.822-1.315a2.942 2.942 0 012.332-1.39zM6.75 12.75a5.25 5.25 0 1110.5 0 5.25 5.25 0 01-10.5 0zm12-1.5a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
          </svg>
      );
    case 'cube':
      return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...svgProps}>
            <path d="M12.378 1.602a.75.75 0 00-.756 0L3 6.632l9 5.25 9-5.25-8.622-5.03zM21.75 7.93l-9 5.25v9l8.628-5.032a.75.75 0 00.372-.648V7.93zM11.25 22.18v-9l-9-5.25v8.57a.75.75 0 00.372.648l8.628 5.033z" />
          </svg>
      );
    case 'check':
      return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...svgProps}>
            <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
          </svg>
      );
    case 'bookmark':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...svgProps}>
          <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z" clipRule="evenodd" />
        </svg>
      );
    case 'calendar':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...svgProps}>
          <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" />
        </svg>
      );
    case 'print':
        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...svgProps}>
              <path fillRule="evenodd" d="M7.875 1.5C6.839 1.5 6 2.34 6 3.375v2.99c-.426.053-.851.11-1.274.174-1.454.218-2.476 1.483-2.476 2.917v6.294a3 3 0 003 3h.27l-.155 1.705A1.875 1.875 0 007.232 22.5h9.536a1.875 1.875 0 001.867-2.045l-.155-1.705h.27a3 3 0 003-3V9.456c0-1.434-1.022-2.7-2.476-2.917A48.814 48.814 0 0018 6.366V3.375c0-1.036-.84-1.875-1.875-1.875h-8.25zM16.5 6.205v-2.83A.375.375 0 0016.125 3h-8.25a.375.375 0 00-.375.375v2.83a49.353 49.353 0 019 0zm-.217 8.295a.75.75 0 10-1.483.22 48.575 48.575 0 01-5.6 0 .75.75 0 00-1.483-.22 50.06 50.06 0 008.566 0zM7.5 9.75a.75.75 0 01.75-.75h2.25a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H8.25a.75.75 0 01-.75-.75V9.75z" clipRule="evenodd" />
            </svg>
        );
    case 'download':
        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...svgProps}>
              <path fillRule="evenodd" d="M12 2.25a.75.75 0 01.75.75v11.69l3.22-3.22a.75.75 0 111.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06l3.22 3.22V3a.75.75 0 01.75-.75zm-9 13.5a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
            </svg>
        );
    case 'plus':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...svgProps}>
          <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
        </svg>
      );
    case 'chat-bubble-left-right':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...svgProps}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
        </svg>
      );
    case 'arrow-left':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...svgProps}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
      );
    case 'paper-airplane':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...svgProps}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>
      );
    case 'paper-clip':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...svgProps}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
        </svg>
      );
    case 'document':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...svgProps}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      );
    case 'user':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...svgProps}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      );
    case 'photo':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...svgProps}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      );
    case 'briefcase':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...svgProps}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.084-.768 2.018-1.827 2.17H5.577c-1.059-.152-1.827-1.086-1.827-2.17v-4.25m16.5-4.162c0 1.084-.768 2.018-1.827 2.17H5.577c-1.059-.152-1.827-1.086-1.827-2.17V9.988c0-1.084.768-2.018 1.827-2.17h12.846c1.059.152 1.827 1.086 1.827 2.17v4.162zm-16.5-4.162V5.5c0-1.084.768-2.018 1.827-2.17h12.846c1.059.152 1.827 1.086 1.827 2.17v4.488" />
        </svg>
      );
    case 'arrow-right':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...svgProps}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      );
    case 'eye':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...svgProps}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case 'eye-off':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...svgProps}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
        </svg>
      );
    case 'bell':
        return (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...svgProps}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
        );
    default:
      return null;
  }
};