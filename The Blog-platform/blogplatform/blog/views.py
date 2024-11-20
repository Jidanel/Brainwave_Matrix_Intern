from django.contrib import messages
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from .models import Article, Comment
from .forms import ArticleForm, CommentForm

@login_required
def article_list(request):
    articles = Article.objects.all()
    return render(request, 'blog/index.html', {'articles': articles})

@login_required
def article_detail(request, pk):
    article = get_object_or_404(Article, pk=pk)
    comments = Comment.objects.filter(article=article)

    if request.method == 'POST':
        form = CommentForm(request.POST)
        if form.is_valid():
            comment = form.save(commit=False)
            comment.article = article
            comment.author = request.user
            comment.save()
            return redirect('blog:article_detail', pk=pk)
    else:
        form = CommentForm()

    return render(request, 'blog/article_detail.html', {
        'article': article,
        'comments': comments,
        'form': form,
    })

@login_required
def article_create(request):
    if request.method == 'POST':
        form = ArticleForm(request.POST)
        if form.is_valid():
            article = form.save(commit=False)
            article.author = request.user
            article.save()
            messages.success(request, 'Article created successfully!')
            return redirect('blog:index')
        else:
            messages.error(request, 'Error creating article.')
    else:
        form = ArticleForm()
    return render(request, 'blog/article_form.html', {'form': form})

@login_required
def article_update(request, pk):
    article = get_object_or_404(Article, pk=pk)
    if article.author != request.user:
        messages.error(request, 'You are not authorized to edit this article.')
        return redirect('blog:index')
    
    if request.method == 'POST':
        form = ArticleForm(request.POST, instance=article)
        if form.is_valid():
            form.save()
            messages.success(request, 'Article updated successfully!')
            return redirect('blog:article_detail', pk=pk)
        else:
            messages.error(request, 'Error updating article.')
    else:
        form = ArticleForm(instance=article)
    return render(request, 'blog/article_form.html', {'form': form})

@login_required
def article_delete(request, pk):
    article = get_object_or_404(Article, pk=pk)
    if article.author == request.user or request.user.is_superuser:
        if request.method == "POST":
            article.delete()
            messages.success(request, 'Article deleted successfully!')
            return redirect('blog:index')
        return render(request, 'blog/article_confirm_delete.html', {'article': article})
    messages.error(request, 'You are not authorized to delete this article.')
    return redirect('blog:index')

@login_required
def add_comment(request, pk):
    article = get_object_or_404(Article, pk=pk)
    if request.method == 'POST':
        form = CommentForm(request.POST)
        if form.is_valid():
            comment = form.save(commit=False)
            comment.article = article
            comment.author = request.user
            comment.save()
            messages.success(request, 'Comment added successfully!')
            return redirect('blog:article_detail', pk=pk)
        else:
            messages.error(request, 'Error adding comment.')
    else:
        form = CommentForm()
    return render(request, 'blog/comment_form.html', {'form': form})

@login_required
def delete_comment(request, pk):
    comment = get_object_or_404(Comment, pk=pk)
    if comment.author == request.user or request.user.is_superuser:
        if request.method == "POST":
            comment.delete()
            messages.success(request, 'Comment deleted successfully!')
            return redirect('blog:article_detail', pk=comment.article.pk)
        return render(request, 'blog/comment_confirm_delete.html', {'comment': comment})
    messages.error(request, 'You are not authorized to delete this comment.')
    return redirect('blog:index')

@login_required
def comment_update(request, pk):
    comment = get_object_or_404(Comment, pk=pk)
    if comment.author != request.user and not request.user.is_staff:
        messages.error(request, "You are not authorized to edit this comment.")
        return redirect('blog:article_detail', pk=comment.article.pk)
    
    if request.method == 'POST':
        form = CommentForm(request.POST, instance=comment)
        if form.is_valid():
            form.save()
            messages.success(request, "Comment updated successfully.")
            return redirect('blog:article_detail', pk=comment.article.pk)
    else:
        form = CommentForm(instance=comment)
    
    return render(request, 'blog/comment_form.html', {'form': form, 'comment': comment})
