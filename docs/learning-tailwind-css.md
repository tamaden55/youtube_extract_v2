# Tailwind CSS と Next.js の連携

このドキュメントでは、Tailwind CSSの基本概念と、Next.jsプロジェクトにおける統合方法について説明します。

## Tailwind CSS とは

Tailwind CSSは、**ユーティリティファースト**のCSSフレームワークです。

### 従来のCSS
```html
<div class="card">
  <h2 class="card-title">Title</h2>
</div>

<style>
.card {
  padding: 1rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.card-title {
  font-size: 1.5rem;
  font-weight: bold;
}
</style>
```

### Tailwind CSS
```html
<div class="p-4 bg-white rounded-lg shadow-md">
  <h2 class="text-2xl font-bold">Title</h2>
</div>
```

- `p-4`: padding: 1rem
- `bg-white`: background-color: white
- `rounded-lg`: border-radius: 0.5rem
- `shadow-md`: box-shadow（中サイズ）
- `text-2xl`: font-size: 1.5rem
- `font-bold`: font-weight: bold

## Tailwind CSS の主要な概念

### 1. ユーティリティクラス

最小単位のスタイルを持つクラス：

```html
<!-- レイアウト -->
<div class="flex justify-center items-center">
  <!-- flex: ディスプレイをflexに -->
  <!-- justify-center: 水平方向中央揃え -->
  <!-- items-center: 垂直方向中央揃え -->
</div>

<!-- スペーシング -->
<div class="m-4 p-2">
  <!-- m-4: margin: 1rem -->
  <!-- p-2: padding: 0.5rem -->
</div>

<!-- 色 -->
<div class="bg-blue-500 text-white">
  <!-- bg-blue-500: 青色の背景（500 = 標準的な濃さ） -->
  <!-- text-white: 白色のテキスト -->
</div>

<!-- サイズ -->
<div class="w-full h-screen">
  <!-- w-full: width: 100% -->
  <!-- h-screen: height: 100vh -->
</div>
```

### 2. レスポンシブデザイン

ブレークポイントプレフィックスを使用：

```html
<div class="w-full md:w-1/2 lg:w-1/3">
  <!-- モバイル: 幅100% -->
  <!-- タブレット(md): 幅50% -->
  <!-- デスクトップ(lg): 幅33.33% -->
</div>
```

**デフォルトのブレークポイント**:
- `sm`: 640px以上
- `md`: 768px以上
- `lg`: 1024px以上
- `xl`: 1280px以上
- `2xl`: 1536px以上

### 3. 状態バリアント

疑似クラスのスタイリング：

```html
<!-- ホバー時 -->
<button class="bg-blue-500 hover:bg-blue-700">
  Hover me
</button>

<!-- フォーカス時 -->
<input class="border border-gray-300 focus:border-blue-500 focus:ring-2" />

<!-- アクティブ時 -->
<button class="bg-blue-500 active:bg-blue-800">
  Click me
</button>

<!-- ダークモード -->
<div class="bg-white dark:bg-gray-800">
  <!-- ライトモード: 白背景 -->
  <!-- ダークモード: 濃いグレー背景 -->
</div>
```

## Next.js との統合

### Tailwind CSS v4 の新しい構文（このプロジェクトで使用）

#### `app/globals.css`
```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}
```

### Tailwind v4 の主な変更点

#### 1. `@import "tailwindcss"` 構文
従来の設定ファイルベースから、CSSインポート方式に変更：

```css
/* v3（旧） */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* v4（新） */
@import "tailwindcss";
```

#### 2. `@theme` ディレクティブ
カスタムテーマをCSS内で直接定義：

```css
@theme inline {
  --color-primary: #3b82f6;
  --color-secondary: #8b5cf6;
  --font-sans: Inter, sans-serif;
}
```

使用例：
```html
<div class="bg-primary text-secondary font-sans">
  <!-- --color-primary 背景 -->
  <!-- --color-secondary テキスト -->
  <!-- --font-sans フォント -->
</div>
```

#### 3. CSS変数の直接利用
カスタムプロパティがより自然に統合：

```css
:root {
  --spacing-large: 2rem;
}

/* Tailwindクラスから使用可能 */
```

### Next.js App Router でのグローバルスタイル読み込み

#### `app/layout.tsx`
```typescript
import './globals.css'  // Tailwind CSSを読み込み

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
```

## よく使うTailwind CSSパターン

### 1. カード UI
```html
<div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
  <h2 class="text-xl font-bold mb-2">Card Title</h2>
  <p class="text-gray-600">Card description</p>
</div>
```

### 2. ボタン
```html
<!-- プライマリボタン -->
<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  Primary
</button>

<!-- アウトラインボタン -->
<button class="border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white py-2 px-4 rounded">
  Outline
</button>

<!-- 無効化ボタン -->
<button class="bg-gray-300 text-gray-500 cursor-not-allowed py-2 px-4 rounded" disabled>
  Disabled
</button>
```

### 3. グリッドレイアウト
```html
<!-- 3カラムグリッド（レスポンシブ） -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div class="bg-white p-4">Item 1</div>
  <div class="bg-white p-4">Item 2</div>
  <div class="bg-white p-4">Item 3</div>
</div>
```

### 4. フレックスボックス
```html
<!-- 水平中央揃え -->
<div class="flex justify-center items-center h-screen">
  <div>Centered content</div>
</div>

<!-- スペースを均等配置 -->
<div class="flex justify-between items-center">
  <div>Left</div>
  <div>Center</div>
  <div>Right</div>
</div>
```

### 5. フォーム
```html
<form class="space-y-4">
  <div>
    <label class="block text-sm font-medium mb-1">Email</label>
    <input
      type="email"
      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="you@example.com"
    />
  </div>
  <button
    type="submit"
    class="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
  >
    Submit
  </button>
</form>
```

## Tailwind CSS のカスタマイズ

### カラーパレットのカスタマイズ
```css
@theme inline {
  --color-brand-50: #eff6ff;
  --color-brand-100: #dbeafe;
  --color-brand-500: #3b82f6;
  --color-brand-900: #1e3a8a;
}
```

使用例：
```html
<div class="bg-brand-500 text-brand-50">
  Custom brand colors
</div>
```

### スペーシングのカスタマイズ
```css
@theme inline {
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 2rem;
  --spacing-xl: 4rem;
}
```

### フォントのカスタマイズ
```css
@theme inline {
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'Fira Code', monospace;
}
```

## Tailwind CSS のベストプラクティス

### 1. コンポーネント化
繰り返し使うスタイルはコンポーネントにまとめる：

```typescript
// components/Button.tsx
export function Button({ children, variant = 'primary' }: ButtonProps) {
  const baseStyles = 'font-bold py-2 px-4 rounded'
  const variantStyles = {
    primary: 'bg-blue-500 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-500 hover:bg-gray-700 text-white',
    outline: 'border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white'
  }

  return (
    <button className={`${baseStyles} ${variantStyles[variant]}`}>
      {children}
    </button>
  )
}
```

### 2. clsx / classnames ライブラリの使用
条件付きクラスを扱いやすくする：

```typescript
import clsx from 'clsx'

function Component({ isActive, isDisabled }: Props) {
  return (
    <div className={clsx(
      'p-4 rounded',
      isActive && 'bg-blue-500 text-white',
      isDisabled && 'opacity-50 cursor-not-allowed',
      !isActive && !isDisabled && 'bg-gray-100'
    )}>
      Content
    </div>
  )
}
```

### 3. 読みやすさのための改行
長いクラス名は改行して読みやすく：

```html
<div
  class="
    flex
    flex-col
    items-center
    justify-between
    p-6
    bg-white
    rounded-lg
    shadow-md
    hover:shadow-lg
    transition-shadow
    duration-300
  "
>
  Content
</div>
```

## Tailwind CSS vs 従来のCSS

### Tailwind CSS の利点

1. **開発速度が速い**
   - CSSファイルを行き来する必要がない
   - 命名に悩まない

2. **一貫性が保たれる**
   - デザインシステムが組み込まれている
   - 色、スペーシング、サイズが統一される

3. **バンドルサイズが最適化**
   - 使用していないスタイルは自動削除（PurgeCSS）
   - プロダクションビルドで最小化

4. **レスポンシブが簡単**
   - ブレークポイント管理が統一
   - モバイルファースト設計

### Tailwind CSS の欠点

1. **HTML が冗長になる**
   - クラス名が長くなりがち
   - マークアップが読みにくくなる可能性

2. **学習コストがある**
   - 多数のユーティリティクラスを覚える必要
   - 最初は生産性が下がる

3. **カスタムデザインに制約**
   - フレームワークの範囲外のデザインは実装しにくい
   - 完全にユニークなデザインには不向き

## Next.js + Tailwind CSS の実装例（このプロジェクトから）

### 検索ページのレイアウト
```typescript
// app/search/page.tsx
<div className="min-h-screen bg-gray-50">
  <div className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold mb-6">YouTube Search</h1>

    <div className="bg-white rounded-lg shadow-md p-6">
      {/* 検索フォーム */}
      <input
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        type="text"
      />
    </div>

    {/* グリッドレイアウトで動画表示 */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {videos.map(video => (
        <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          <img className="w-full h-48 object-cover" src={video.thumbnail} alt={video.title} />
          <div className="p-4">
            <h3 className="font-bold text-lg mb-2">{video.title}</h3>
            <p className="text-gray-600 text-sm">{video.channelTitle}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>
```

## 参考リソース

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind CSS v4 Alpha](https://tailwindcss.com/blog/tailwindcss-v4-alpha)
- [Next.js + Tailwind CSS](https://nextjs.org/docs/app/building-your-application/styling/tailwind-css)
- [Tailwind UI](https://tailwindui.com/) - 公式コンポーネントライブラリ
- [Headless UI](https://headlessui.com/) - アクセシブルなUIコンポーネント
