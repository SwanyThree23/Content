import { Film, Sparkles, Zap, Youtube, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Film className="w-16 h-16 text-purple-500" />
            <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              AI Soap Opera Studio
            </h1>
          </div>
          <p className="text-2xl text-gray-300 mb-8">
            Create, Generate & Publish Automated Soap Operas with AI
          </p>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto mb-12">
            Professional AI-powered content studio that generates complete soap opera episodes
            with scripts, videos, and automated YouTube publishing. From idea to viral content
            in minutes.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/studio"
              className="px-8 py-4 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition font-semibold text-lg"
            >
              Launch Studio <ArrowRight className="inline ml-2 w-5 h-5" />
            </Link>
            <Link
              href="/docs"
              className="px-8 py-4 rounded-lg bg-gray-800 hover:bg-gray-700 transition font-semibold text-lg border border-gray-700"
            >
              View Documentation
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-gray-800/50 rounded-xl p-8 backdrop-blur-sm border border-gray-700">
            <Sparkles className="w-12 h-12 text-purple-500 mb-4" />
            <h3 className="text-xl font-bold mb-3">AI Script Generation</h3>
            <p className="text-gray-400">
              Claude AI writes compelling soap opera scripts with drama, tension, and cliffhangers
              in 30 seconds.
            </p>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-8 backdrop-blur-sm border border-gray-700">
            <Zap className="w-12 h-12 text-yellow-500 mb-4" />
            <h3 className="text-xl font-bold mb-3">Veo 3 Video Generation</h3>
            <p className="text-gray-400">
              Google's Veo 3 creates professional cinematic videos for each scene automatically.
            </p>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-8 backdrop-blur-sm border border-gray-700">
            <Youtube className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-xl font-bold mb-3">Auto YouTube Publishing</h3>
            <p className="text-gray-400">
              Automated upload, SEO optimization, and publishing to your YouTube channel.
            </p>
          </div>
        </div>

        {/* Workflow */}
        <div className="bg-gray-800/50 rounded-xl p-8 backdrop-blur-sm border border-gray-700">
          <h2 className="text-3xl font-bold mb-8 text-center">How It Works</h2>
          <div className="grid md:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xl mx-auto mb-4">
                1
              </div>
              <h4 className="font-semibold mb-2">Create Series</h4>
              <p className="text-sm text-gray-400">Define your soap opera concept</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xl mx-auto mb-4">
                2
              </div>
              <h4 className="font-semibold mb-2">Generate Script</h4>
              <p className="text-sm text-gray-400">AI writes complete episode</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xl mx-auto mb-4">
                3
              </div>
              <h4 className="font-semibold mb-2">Create Videos</h4>
              <p className="text-sm text-gray-400">Veo 3 generates scenes</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xl mx-auto mb-4">
                4
              </div>
              <h4 className="font-semibold mb-2">Auto Edit</h4>
              <p className="text-sm text-gray-400">CapCut compiles episode</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xl mx-auto mb-4">
                5
              </div>
              <h4 className="font-semibold mb-2">Publish</h4>
              <p className="text-sm text-gray-400">Auto upload to YouTube</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mt-20">
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-500 mb-2">30s</div>
            <div className="text-gray-400">Script Generation</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-500 mb-2">20min</div>
            <div className="text-gray-400">Video Creation</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-500 mb-2">100%</div>
            <div className="text-gray-400">Automated</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-500 mb-2">∞</div>
            <div className="text-gray-400">Possibilities</div>
          </div>
        </div>
      </div>
    </div>
  );
}
