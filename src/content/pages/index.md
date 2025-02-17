---
title: Ernst Erlanson
template: main.html
---

# Ernst Erlanson

## Short bio

I am a pianist, teacher, and composer. I primarily make and think about music. 
Because problems transcend subjects, I tend to follow my curiosity into other fields. 
I live in Sweden.   

## Contact me

If you need a pianist, teacher or composer contact me [here](/contact.html). Also if you just want to say [hello](/contact.html).

<div class="latest-posts">
    <h2>Latest Blog Posts</h2>
    <div class="post-previews">
        {{#each recentPosts}}
        <article class="post-preview">
            <h3><a href="{{url}}">{{title}}</a></h3>
            <div class="post-meta">
                <time datetime="{{date}}">{{formatDate date}}</time>
                {{#if author}}<span class="author">By {{author}}</span>{{/if}}
            </div>
            {{#if excerpt}}<p class="excerpt">{{excerpt}}</p>{{/if}}
        </article>
        {{/each}}
    </div>
    <div class="view-all">
        <a href="/blog" class="read-more">View all posts →</a>
    </div>
</div> 